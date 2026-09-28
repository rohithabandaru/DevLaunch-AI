import type { EmailConnection, EmailProvider } from '@/types/job-types';
import type { RawEmailInput } from './ai';

/**
 * Browser-side client for the mailbox sync API.
 *
 * The browser never holds a Google credential: it asks our own Route Handlers to
 * run the OAuth dance and to read the mailbox, and receives only plain message
 * content back.
 */

export type SyncStatusCode =
  | 'connected'
  | 'denied'
  | 'provider_error'
  | 'invalid_state'
  | 'missing_code'
  | 'missing_refresh_token'
  | 'profile_unavailable'
  | 'storage_unavailable'
  | 'exchange_failed'
  | 'not_configured'
  | 'unauthenticated';

/** User-facing copy for the `?email_sync=` status returned by the OAuth routes. */
export const SYNC_STATUS_MESSAGES: Record<SyncStatusCode, string> = {
  connected: 'Gmail connected. Run a sync to pull in your job emails.',
  denied: 'Gmail connection cancelled. Nothing was changed.',
  provider_error: 'Google returned an error and the mailbox was not connected.',
  invalid_state: 'The Gmail connection attempt expired or was tampered with. Please try again.',
  missing_code: 'Google did not return an authorization code. Please try again.',
  missing_refresh_token: 'Google did not issue a refresh token, so the connection could not be stored.',
  profile_unavailable: 'Connected to Google, but the Gmail address could not be read. Please try again.',
  storage_unavailable: 'The mailbox was authorized but could not be stored on the server. Please contact support.',
  exchange_failed: 'Could not complete the Gmail connection. Please try again.',
  not_configured: 'Gmail sync is not configured on this server. Add GOOGLE_OAUTH_CLIENT_ID.',
  unauthenticated: 'Sign in before connecting a mailbox.',
};

export class EmailSyncClientError extends Error {
  readonly code: SyncStatusCode | 'request_failed';

  constructor(code: SyncStatusCode | 'request_failed', message: string) {
    super(message);
    this.name = 'EmailSyncClientError';
    this.code = code;
  }
}

/** Narrows an untrusted `?email_sync=` value to a known status code. */
export function parseSyncStatus(value: string | null): SyncStatusCode | null {
  if (!value) return null;
  return (Object.keys(SYNC_STATUS_MESSAGES) as SyncStatusCode[]).includes(value as SyncStatusCode)
    ? (value as SyncStatusCode)
    : null;
}

async function readJson(res: Response): Promise<{ data: unknown; error: string | null }> {
  const payload = (await res.json().catch(() => null)) as
    | { error?: string; [key: string]: unknown }
    | null;
  return { data: payload, error: typeof payload?.error === 'string' ? payload.error : null };
}

export async function fetchEmailConnections(): Promise<EmailConnection[]> {
  const res = await fetch('/api/email/connections', { cache: 'no-store' });
  const { data, error } = await readJson(res);
  if (!res.ok || !data || typeof data !== 'object') {
    throw new EmailSyncClientError('request_failed', error || 'Could not load mailbox connections.');
  }
  const connections = (data as { connections?: unknown }).connections;
  return Array.isArray(connections) ? (connections as EmailConnection[]) : [];
}

/**
 * Begins the Gmail OAuth flow.
 *
 * This is deliberately a plain link (`/api/email/gmail/connect`) rather than a
 * programmatic navigation: the route handler sets httpOnly state/PKCE cookies
 * and 302s off to Google, which is a full document navigation.
 */

export interface SyncMailboxResult {
  messages: RawEmailInput[];
  mailboxEmail: string;
  scannedAt: string;
}

export async function syncGmailMailbox(): Promise<SyncMailboxResult> {
  const res = await fetch('/api/email/gmail/sync', { method: 'POST', cache: 'no-store' });
  const { data, error } = await readJson(res);
  if (!res.ok || !data || typeof data !== 'object') {
    throw new EmailSyncClientError('request_failed', error || 'Could not sync the mailbox.');
  }

  const payload = data as { messages?: unknown; mailboxEmail?: unknown; scannedAt?: unknown };
  return {
    messages: Array.isArray(payload.messages) ? (payload.messages as RawEmailInput[]) : [],
    mailboxEmail: typeof payload.mailboxEmail === 'string' ? payload.mailboxEmail : '',
    scannedAt: typeof payload.scannedAt === 'string' ? payload.scannedAt : new Date().toISOString(),
  };
}

export async function disconnectEmailConnection(id: string): Promise<void> {
  const res = await fetch(`/api/email/connections/${encodeURIComponent(id)}`, { method: 'DELETE' });
  const { error } = await readJson(res);
  if (!res.ok) {
    throw new EmailSyncClientError('request_failed', error || 'Could not disconnect the mailbox.');
  }
}

export async function setEmailConnectionAutoSync(id: string, autoSync: boolean): Promise<EmailConnection | null> {
  const res = await fetch(`/api/email/connections/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autoSync }),
  });
  const { data, error } = await readJson(res);
  if (!res.ok || !data || typeof data !== 'object') {
    throw new EmailSyncClientError('request_failed', error || 'Could not update auto-sync.');
  }
  const connection = (data as { connection?: unknown }).connection;
  return connection && typeof connection === 'object' ? (connection as EmailConnection) : null;
}

/** Providers with a working server-side implementation. */
export const SUPPORTED_PROVIDERS: EmailProvider[] = ['gmail'];
