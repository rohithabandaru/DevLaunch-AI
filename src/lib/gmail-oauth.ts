/**
 * Server-only Gmail integration for the job tracker's "AI Email Sync Engine".
 *
 * Everything that touches a Google credential lives here and is only imported
 * from Route Handlers, so the access token never reaches the browser.
 *
 * This replaces the previous client-side implementation, which:
 *   - used the deprecated implicit flow (`response_type=token`),
 *   - hardcoded a fallback Google client ID,
 *   - kept the raw access token in localStorage/sessionStorage,
 *   - called the Gmail REST API straight from the browser,
 *   - fetched up to 100 messages strictly sequentially,
 *   - used only the Gmail `snippet` (never the real body), and
 *   - swallowed every failure, falling back to fabricated sample emails.
 */

import { createHash, randomBytes } from 'node:crypto';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

/**
 * `gmail.readonly` is all the job tracker needs: we read recruiter/ATS mail and
 * never send, modify or delete anything in the mailbox. `access_type=offline`
 * yields a refresh token so the connection survives the 1-hour access token.
 */
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

const DEFAULT_MAX_MESSAGES = 50;
const DEFAULT_SYNC_DAYS = 30;
const MESSAGE_FETCH_CONCURRENCY = 8;
const MAX_BODY_CHARS = 4000;
const REQUEST_TIMEOUT_MS = 15000;

export type GmailSyncErrorCode =
  | 'not_configured'
  | 'not_connected'
  | 'token_expired'
  | 'revoked'
  | 'api_disabled'
  | 'insufficient_scope'
  | 'rate_limited'
  | 'upstream';

/** Typed failure so API routes can map failures to status codes + safe messages. */
export class GmailSyncError extends Error {
  readonly code: GmailSyncErrorCode;

  constructor(code: GmailSyncErrorCode, message: string) {
    super(message);
    this.name = 'GmailSyncError';
    this.code = code;
  }
}

export interface GoogleOAuthConfig {
  clientId: string;
  /**
   * Optional. This flow is a public client using PKCE: the code verifier stays
   * server-side and is what actually authenticates the token exchange, so a
   * client secret adds no security here. Google's console also stops issuing
   * secrets for some client types, so the flow must work without one. When it
   * IS configured we still send it, because a confidential Web-application
   * client may reject a secretless exchange.
   */
  clientSecret: string | null;
  redirectUri: string;
}

export interface StoredGoogleToken {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scopes: string | null;
}

export interface GmailMessage {
  id: string;
  sender: string;
  subject: string;
  /** ISO-8601 timestamp. */
  date: string;
  body: string;
}

/** Returns the Google OAuth config, or null when the app is not configured. */
export function getGoogleOAuthConfig(origin?: string): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  if (!clientId) return null;

  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || `${resolveOrigin(origin)}/api/email/gmail/callback`;

  return { clientId, clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() || null, redirectUri };
}

function resolveOrigin(origin?: string): string {
  if (origin) return origin.replace(/\/+$/, '');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) return siteUrl.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID?.trim());
}

// ---------------------------------------------------------------------------
// PKCE + state
// ---------------------------------------------------------------------------

export interface PkcePair {
  verifier: string;
  challenge: string;
}

/**
 * Generates an RFC 7636 S256 PKCE verifier/challenge pair. PKCE is what makes the
 * authorization-code flow safe for a public client, and Google requires it for
 * newly created clients.
 */
export function generatePkcePair(): PkcePair {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

/** Opaque, single-use CSRF state for the OAuth round trip. */
export function generateOAuthState(): string {
  return randomBytes(24).toString('base64url');
}

/**
 * Short-lived, httpOnly cookies that carry the OAuth round trip between
 * `connect` and `callback`. The PKCE verifier is a secret, so it must never be
 * readable from JavaScript; `sameSite: 'lax'` is required so the top-level
 * navigation back from Google still sends them.
 */
export const OAUTH_STATE_COOKIE = 'devlaunch_gmail_oauth_state';
export const OAUTH_VERIFIER_COOKIE = 'devlaunch_gmail_pkce_verifier';
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 600;

export function oauthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

/** Where the browser is sent once the OAuth dance finishes. */
export const EMAIL_SYNC_RETURN_PATH = '/dashboard/jobs';

export function buildSyncReturnUrl(origin: string, status: string): string {
  const url = new URL(EMAIL_SYNC_RETURN_PATH, origin);
  url.searchParams.set('email_sync', status);
  return url.toString();
}

/** Constant-time state comparison. */
export function statesMatch(expected: string | undefined | null, received: string | null): boolean {
  if (!expected || !received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function buildGoogleAuthUrl(
  config: GoogleOAuthConfig,
  state: string,
  codeChallenge: string,
  options: { forceConsent?: boolean } = {},
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    include_granted_scopes: 'true',
    // Google only returns a refresh_token when it (re-)shows the consent screen.
    // Forcing it guarantees the token, but nagging the user on every reconnect is
    // bad UX, so it is opt-in: the caller forces it only when no refresh token is
    // already stored and the reconnect would otherwise be dead on arrival.
    prompt: options.forceConsent ? 'select_account consent' : 'select_account',
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Token exchange / refresh / revoke
// ---------------------------------------------------------------------------

function parseTokenResponse(payload: Record<string, unknown>): StoredGoogleToken {
  const accessToken = typeof payload.access_token === 'string' ? payload.access_token : '';
  if (!accessToken) {
    throw new GmailSyncError('upstream', 'Google did not return an access token.');
  }
  const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : null;
  return {
    accessToken,
    refreshToken: typeof payload.refresh_token === 'string' ? payload.refresh_token : null,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
    scopes: typeof payload.scope === 'string' ? payload.scope : null,
  };
}

async function postToGoogleTokenEndpoint(
  config: GoogleOAuthConfig,
  body: URLSearchParams,
): Promise<Record<string, unknown>> {
  const response = await withTimeout(
    fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    }),
  );

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const errorCode = typeof payload.error === 'string' ? payload.error : '';
    if (errorCode === 'invalid_grant') {
      throw new GmailSyncError('revoked', 'Google rejected the stored refresh token. Please reconnect your mailbox.');
    }
    if (errorCode === 'invalid_client' || errorCode === 'unauthorized_client') {
      throw new GmailSyncError('not_configured', 'Google rejected the OAuth client ID or secret.');
    }
    throw new GmailSyncError('upstream', 'Google refused the token request.');
  }

  return payload;
}

/**
 * Client credentials for a token-endpoint call. PKCE authenticates the exchange
 * via the code verifier, so `client_secret` is only attached when one is
 * actually configured; Google rejects the request as a public client otherwise.
 */
function clientAuthParams(config: GoogleOAuthConfig): Record<string, string> {
  return config.clientSecret
    ? { client_id: config.clientId, client_secret: config.clientSecret }
    : { client_id: config.clientId };
}

/** Exchanges an authorization code (+ PKCE verifier) for tokens. */
export async function exchangeAuthorizationCode(
  config: GoogleOAuthConfig,
  code: string,
  codeVerifier: string,
): Promise<StoredGoogleToken> {
  const body = new URLSearchParams({
    code,
    code_verifier: codeVerifier,
    ...clientAuthParams(config),
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });
  return parseTokenResponse(await postToGoogleTokenEndpoint(config, body));
}

/**
 * Exchanges a refresh token for a new access token. Google does not always
 * return a new refresh token, so callers must keep the existing one.
 */
export async function refreshAccessToken(config: GoogleOAuthConfig, refreshToken: string): Promise<StoredGoogleToken> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    ...clientAuthParams(config),
    grant_type: 'refresh_token',
  });
  return parseTokenResponse(await postToGoogleTokenEndpoint(config, body));
}

/** Best-effort token revocation, used when a user disconnects. */
export async function revokeGoogleToken(token: string): Promise<void> {
  try {
    await withTimeout(
      fetch(GOOGLE_REVOKE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token }),
        cache: 'no-store',
      }),
    );
  } catch {
    // Revocation is a courtesy: the local row is deleted regardless, and Google
    // garbage-collects unrefreshed grants after ~7 days of inactivity.
  }
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  name?: string;
}

export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile | null> {
  const response = await withTimeout(
    fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    }),
  );
  if (!response.ok) return null;

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload || typeof payload.email !== 'string') return null;

  return {
    id: typeof payload.id === 'string' ? payload.id : '',
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : undefined,
  };
}

// ---------------------------------------------------------------------------
// Mailbox reading
// ---------------------------------------------------------------------------

export interface FetchGmailOptions {
  /** Hard cap on how many messages are read. Defaults to 50. */
  maxMessages?: number;
  /** How far back to look. Defaults to 30 days. */
  lookbackDays?: number;
}

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Gmail search query. Tuned for job mail: the inbox, recent, minus the bulk
 * categories that would otherwise flood the scan with newsletters.
 */
export function buildMailboxQuery(lookbackDays: number): string {
  const override = process.env.GMAIL_SYNC_QUERY?.trim();
  if (override) return override;
  const days = Math.max(1, Math.floor(lookbackDays));
  return `in:inbox newer_than:${days}d -category:promotions -category:social -category:forums -category:updates`;
}

/** Maps a Gmail API failure onto a typed, user-safe error. */
async function gmailApiError(response: Response): Promise<GmailSyncError> {
  const body = await response.text().catch(() => '');
  const detail = body.slice(0, 500);

  if (response.status === 401) {
    return new GmailSyncError('token_expired', 'Your Gmail authorization expired. Please reconnect your mailbox.');
  }
  if (response.status === 429) {
    return new GmailSyncError('rate_limited', 'Gmail rate limit reached. Please wait a moment and try again.');
  }
  if (response.status === 403) {
    if (/SERVICE_DISABLED|has not been used|is disabled/i.test(detail)) {
      return new GmailSyncError(
        'api_disabled',
        'The Gmail API is not enabled for this app. Enable it in Google Cloud Console, then reconnect.',
      );
    }
    if (/insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT|403 Forbidden/i.test(detail)) {
      return new GmailSyncError('insufficient_scope', 'Gmail access was revoked or the scope is missing. Please reconnect.');
    }
    return new GmailSyncError('upstream', 'Gmail refused the request (403).');
  }
  if (response.status >= 500) {
    return new GmailSyncError('upstream', 'Gmail is temporarily unavailable. Please try again shortly.');
  }
  return new GmailSyncError('upstream', `Gmail request failed (${response.status}).`);
}

/** Runs `worker` over `items` with at most `limit` in flight. Preserves order. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  const bounded = Math.max(1, Math.min(limit, items.length));
  let cursor = 0;

  async function drain(): Promise<void> {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: bounded }, drain));
  return results;
}

function decodeBase64UrlBody(data: string | undefined): string {
  if (!data) return '';
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(Buffer.from(data, 'base64url'));
  } catch {
    return '';
  }
}

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|head)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos|#39);/g, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface GmailHeader {
  name?: string;
  value?: string;
}

interface GmailPart {
  mimeType?: string;
  body?: { data?: string };
  headers?: GmailHeader[];
  parts?: GmailPart[];
}

/** Walks the MIME tree and returns readable plain text, truncated to MAX_BODY_CHARS. */
export function extractPlainText(payload: GmailPart | undefined, snippet: string): string {
  if (!payload) return snippet.slice(0, MAX_BODY_CHARS);

  const collected: string[] = [];

  const walk = (part: GmailPart): void => {
    const mime = part.mimeType || '';
    if (mime === 'text/plain') {
      const text = decodeBase64UrlBody(part.body?.data);
      if (text.trim()) collected.push(text);
      return;
    }
    if (mime === 'text/html') {
      const html = decodeBase64UrlBody(part.body?.data);
      if (html.trim()) collected.push(htmlToText(html));
      return;
    }
    if (Array.isArray(part.parts)) {
      part.parts.forEach(walk);
      return;
    }
    if (!part.parts && part.body?.data) {
      collected.push(decodeBase64UrlBody(part.body.data));
    }
  };

  walk(payload);

  const body = collected.join('\n\n').trim();
  const source = body.length > 0 ? body : snippet;
  return source.length > MAX_BODY_CHARS ? `${source.slice(0, MAX_BODY_CHARS)}\n[…truncated]` : source;
}

function readHeader(headers: GmailHeader[], name: string): string | null {
  const match = headers.find((h) => (h.name || '').toLowerCase() === name);
  const value = match?.value;
  return value && value.trim() ? value.trim() : null;
}

function parseSenderAddress(from: string): string {
  const angle = from.match(/<([^>]+)>/);
  if (angle) return angle[1].trim();
  return from.split('@')[0]?.trim() || from;
}

interface GmailListResponse {
  messages?: Array<{ id?: string }>;
}

interface GmailMessageResponse {
  id?: string;
  snippet?: string;
  internalDate?: string;
  payload?: GmailPart;
}

async function gmailGet<T>(accessToken: string, url: string): Promise<T> {
  const response = await withTimeout(
    fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }),
  );
  if (!response.ok) throw await gmailApiError(response);
  return (await response.json()) as T;
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new GmailSyncError('upstream', 'The mailbox request timed out. Please try again.')),
      REQUEST_TIMEOUT_MS,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Reads recent inbox messages, fetching bodies with bounded concurrency.
 *
 * Throws a {@link GmailSyncError} on any upstream failure — this never returns
 * fabricated data, so callers can surface a real error to the user.
 */
export async function fetchGmailMessages(
  accessToken: string,
  options: FetchGmailOptions = {},
): Promise<GmailMessage[]> {
  const maxMessages = Math.min(
    readPositiveInt(process.env.GMAIL_SYNC_MAX_MESSAGES, DEFAULT_MAX_MESSAGES),
    options.maxMessages ?? Number.MAX_SAFE_INTEGER,
  );
  const lookbackDays = readPositiveInt(process.env.GMAIL_SYNC_DAYS, DEFAULT_SYNC_DAYS);
  const query = encodeURIComponent(buildMailboxQuery(options.lookbackDays ?? lookbackDays));

  const listUrl = `${GMAIL_API_BASE}/messages?maxResults=${maxMessages}&q=${query}&labelIds=INBOX`;
  const list = await gmailGet<GmailListResponse>(accessToken, listUrl);

  const ids = (list.messages ?? [])
    .map((m) => (typeof m.id === 'string' ? m.id : ''))
    .filter(Boolean)
    .slice(0, maxMessages);
  if (ids.length === 0) return [];

  const fetched = await mapWithConcurrency(ids, MESSAGE_FETCH_CONCURRENCY, async (id): Promise<GmailMessage | null> => {
    try {
      const data = await gmailGet<GmailMessageResponse>(accessToken, `${GMAIL_API_BASE}/messages/${id}?format=full`);
      const headers: GmailHeader[] = Array.isArray(data.payload?.headers) ? (data.payload?.headers as GmailHeader[]) : [];

      const from = readHeader(headers, 'from') || 'Unknown sender';
      const subject = readHeader(headers, 'subject') || '(no subject)';
      const headerDate = readHeader(headers, 'date');
      const parsedHeaderDate = headerDate ? Date.parse(headerDate) : Number.NaN;
      const internalDate = typeof data.internalDate === 'string' ? Number.parseInt(data.internalDate, 10) : Number.NaN;

      const timestamp = Number.isFinite(internalDate)
        ? internalDate
        : Number.isFinite(parsedHeaderDate)
          ? parsedHeaderDate
          : Date.now();

      return {
        id,
        sender: parseSenderAddress(from),
        subject,
        date: new Date(timestamp).toISOString(),
        body: extractPlainText(data.payload, data.snippet || ''),
      };
    } catch (error) {
      // A single unreadable message must not abort the whole sync, but a 401
      // means the token itself is dead and every remaining fetch will fail too.
      if (error instanceof GmailSyncError && (error.code === 'token_expired' || error.code === 'revoked')) {
        throw error;
      }
      return null;
    }
  });

  return fetched.filter((m): m is GmailMessage => m !== null);
}

/** Human-readable, safe messages for each error code. */
export const GMAIL_ERROR_MESSAGES: Record<GmailSyncErrorCode, string> = {
  not_configured: 'Gmail sync is not configured on this server. Set GOOGLE_OAUTH_CLIENT_ID.',
  not_connected: 'No mailbox is connected. Connect Gmail to sync job emails.',
  token_expired: 'Your Gmail authorization expired. Please reconnect your mailbox.',
  revoked: 'Google revoked this mailbox authorization. Please reconnect your mailbox.',
  api_disabled: 'The Gmail API is not enabled for this app. Enable it in Google Cloud Console, then reconnect.',
  insufficient_scope: 'Gmail access was revoked or the scope is missing. Please reconnect your mailbox.',
  rate_limited: 'Gmail rate limit reached. Please wait a moment and try again.',
  upstream: 'Could not reach Gmail. Please try again shortly.',
};

/** Maps a typed error to an HTTP status code for the sync route. */
export function gmailErrorStatus(code: GmailSyncErrorCode): number {
  switch (code) {
    case 'not_configured':
      return 503;
    case 'not_connected':
      return 409;
    case 'token_expired':
    case 'revoked':
    case 'insufficient_scope':
      return 401;
    case 'rate_limited':
      return 429;
    default:
      return 502;
  }
}
