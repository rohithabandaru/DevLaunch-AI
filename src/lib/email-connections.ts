/**
 * Server-only persistence for mailbox OAuth connections.
 *
 * All reads and writes go through the Supabase service role client: RLS
 * deliberately exposes no INSERT/UPDATE policy, so the encrypted token columns
 * can only be touched by this module (and therefore only by Route Handlers).
 *
 * Encrypt/decrypt is delegated to `email-token-crypto`, Gmail specifics to
 * `gmail-oauth`.
 */

import { getServiceRoleClient } from './auth-server';
import { decryptToken, encryptToken, isEncryptedToken } from './email-token-crypto';
import {
  GmailSyncError,
  getGoogleOAuthConfig,
  refreshAccessToken,
  revokeGoogleToken,
  type StoredGoogleToken,
} from './gmail-oauth';
import type { EmailConnection, EmailProvider } from '@/types/job-types';

/** Refresh this many milliseconds before the access token actually expires. */
const TOKEN_REFRESH_SKEW_MS = 60_000;

interface EmailConnectionRow {
  id: string;
  user_id: string;
  provider: EmailProvider;
  mailbox_email: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  scopes: string | null;
  auto_sync: boolean;
  status: 'connected' | 'error' | 'disconnected';
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS =
  'id, user_id, provider, mailbox_email, access_token_encrypted, refresh_token_encrypted, token_expires_at, scopes, auto_sync, status, last_synced_at, created_at, updated_at';

function requireServiceRole() {
  const client = getServiceRoleClient();
  if (!client) {
    throw new GmailSyncError(
      'not_configured',
      'Server storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY to enable mailbox sync.',
    );
  }
  return client;
}

/** Projects a DB row onto the client-facing shape. Never includes token material. */
export function toClientConnection(row: EmailConnectionRow): EmailConnection {
  return {
    id: row.id,
    provider: row.provider,
    email: row.mailbox_email,
    connectedAt: row.created_at,
    lastSyncedAt: row.last_synced_at || undefined,
    autoSync: row.auto_sync,
    status: row.status,
  };
}

export async function listEmailConnections(userId: string): Promise<EmailConnection[]> {
  const supabase = requireServiceRole();
  const { data, error } = await supabase
    .from('email_connections')
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new GmailSyncError('upstream', 'Could not load mailbox connections.');
  return ((data ?? []) as EmailConnectionRow[]).map(toClientConnection);
}

/**
 * Whether this user already has a usable refresh token stored for the provider.
 *
 * Used by the connect route to decide whether it must force the consent screen:
 * Google only issues a refresh token when it actually shows that screen, but
 * forcing it on every reconnect nags the user. If a token is already stored, the
 * reconnect can proceed silently and reuse it.
 *
 * Never throws: if the store is unreachable we answer `false`, which makes the
 * caller force consent — the safe direction, since a fresh grant always works.
 */
export async function hasStoredRefreshToken(userId: string, provider: EmailProvider): Promise<boolean> {
  const supabase = getServiceRoleClient();
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('email_connections')
      .select('refresh_token_encrypted')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle();
    if (error) return false;
    const existing = (data as { refresh_token_encrypted?: string | null } | null)?.refresh_token_encrypted;
    return isEncryptedToken(existing);
  } catch {
    return false;
  }
}

export async function getEmailConnectionRow(
  userId: string,
  id: string,
): Promise<EmailConnectionRow | null> {
  const supabase = requireServiceRole();
  const { data, error } = await supabase
    .from('email_connections')
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new GmailSyncError('upstream', 'Could not load the mailbox connection.');
  return (data as EmailConnectionRow | null) ?? null;
}

export async function getEmailConnectionRowByProvider(
  userId: string,
  provider: EmailProvider,
): Promise<EmailConnectionRow | null> {
  const supabase = requireServiceRole();
  const { data, error } = await supabase
    .from('email_connections')
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle();

  if (error) throw new GmailSyncError('upstream', 'Could not load the mailbox connection.');
  return (data as EmailConnectionRow | null) ?? null;
}

/** Decrypts a row's access token, or null when the envelope cannot be opened. */
export function readAccessToken(row: EmailConnectionRow): string | null {
  return decryptToken(row.access_token_encrypted);
}

export function readRefreshToken(row: EmailConnectionRow): string | null {
  return row.refresh_token_encrypted ? decryptToken(row.refresh_token_encrypted) : null;
}

function tokenExpiresAt(token: StoredGoogleToken, fallback: string | null): string | null {
  return (token.expiresAt ?? (fallback ? new Date(fallback) : null))?.toISOString() ?? null;
}

/**
 * Creates or replaces a connection for (user, provider). Tokens are encrypted
 * before they are written; the plaintext never leaves this function.
 *
 * A refresh token is mandatory, because the connection dies after Google's
 * ~1h access token expires. Google only issues one when it shows the consent
 * screen, so when the token response omits it we fall back to the refresh token
 * already stored for this (user, provider) rather than failing the reconnect —
 * the old grant is still valid and re-consenting is not the user's job.
 */
export async function upsertEmailConnection(params: {
  userId: string;
  provider: EmailProvider;
  mailboxEmail: string;
  token: StoredGoogleToken;
  scopes?: string | null;
}): Promise<{ id: string } | null> {
  const supabase = requireServiceRole();
  const refreshTokenCiphertext = await resolveRefreshTokenCiphertext(
    supabase,
    params.userId,
    params.provider,
    params.token.refreshToken,
  );
  if (!refreshTokenCiphertext) {
    throw new GmailSyncError('revoked', 'Google did not issue a refresh token, so the connection cannot be stored.');
  }

  const row = {
    user_id: params.userId,
    provider: params.provider,
    mailbox_email: params.mailboxEmail,
    access_token_encrypted: encryptToken(params.token.accessToken),
    refresh_token_encrypted: refreshTokenCiphertext,
    token_expires_at: tokenExpiresAt(params.token, null),
    scopes: params.scopes ?? params.token.scopes ?? null,
    auto_sync: true,
    status: 'connected',
  };

  const { data, error } = await supabase
    .from('email_connections')
    .upsert(row, { onConflict: 'user_id,provider', ignoreDuplicates: false })
    .select('id')
    .maybeSingle();

  if (error) throw new GmailSyncError('upstream', 'Could not save the mailbox connection.');
  const id = (data as { id?: string } | null)?.id;
  return id ? { id } : null;
}

/**
 * The ciphertext to store in `refresh_token_encrypted`: the freshly issued one,
 * or the existing row's if Google returned none. Returns null when there is
 * nothing to store, which is the only genuinely unusable case.
 */
async function resolveRefreshTokenCiphertext(
  supabase: NonNullable<ReturnType<typeof getServiceRoleClient>>,
  userId: string,
  provider: EmailProvider,
  freshRefreshToken: string | null,
): Promise<string | null> {
  if (freshRefreshToken) return encryptToken(freshRefreshToken);

  const { data, error } = await supabase
    .from('email_connections')
    .select('refresh_token_encrypted')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle();
  if (error) throw new GmailSyncError('upstream', 'Could not read the existing mailbox connection.');

  const existing = (data as { refresh_token_encrypted?: string | null } | null)?.refresh_token_encrypted;
  return isEncryptedToken(existing) ? existing : null;
}

/** Persists refreshed token material, keeping the previous refresh token. */
export async function updateConnectionTokens(
  id: string,
  token: StoredGoogleToken,
  previousRefreshToken: string | null,
): Promise<void> {
  const supabase = requireServiceRole();
  const { error } = await supabase
    .from('email_connections')
    .update({
      access_token_encrypted: encryptToken(token.accessToken),
      refresh_token_encrypted: (token.refreshToken ?? previousRefreshToken)
        ? encryptToken(token.refreshToken ?? (previousRefreshToken as string))
        : null,
      token_expires_at: tokenExpiresAt(token, null),
      scopes: token.scopes,
    })
    .eq('id', id);

  if (error) throw new GmailSyncError('upstream', 'Could not refresh the mailbox authorization.');
}

export function needsRefresh(row: EmailConnectionRow): boolean {
  if (!row.token_expires_at) return true;
  const expiry = new Date(row.token_expires_at).getTime();
  if (Number.isNaN(expiry)) return true;
  return expiry - Date.now() <= TOKEN_REFRESH_SKEW_MS;
}

/**
 * Returns a usable access token, transparently refreshing it when it is
 * expired or about to expire. Throws `revoked` when the refresh token is dead,
 * which the caller should turn into "please reconnect".
 */
export async function getFreshAccessToken(
  row: EmailConnectionRow,
  origin?: string,
): Promise<string> {
  const accessToken = readAccessToken(row);
  if (!accessToken) {
    throw new GmailSyncError('revoked', 'The stored mailbox token could not be decrypted. Please reconnect.');
  }
  if (!needsRefresh(row)) return accessToken;

  const refreshToken = readRefreshToken(row);
  if (!refreshToken) {
    throw new GmailSyncError('token_expired', 'Your Gmail authorization expired. Please reconnect your mailbox.');
  }

  const config = getGoogleOAuthConfig(origin);
  if (!config) {
    throw new GmailSyncError('not_configured', 'Gmail sync is not configured on this server.');
  }

  let refreshed: StoredGoogleToken;
  try {
    refreshed = await refreshAccessToken(config, refreshToken);
  } catch (error) {
    await setConnectionStatus(row.id, 'error');
    throw error;
  }

  await updateConnectionTokens(row.id, refreshed, refreshToken);
  row.access_token_encrypted = encryptToken(refreshed.accessToken);
  row.token_expires_at = tokenExpiresAt(refreshed, row.token_expires_at);
  return refreshed.accessToken;
}

export async function setConnectionStatus(
  id: string,
  status: 'connected' | 'error' | 'disconnected',
): Promise<void> {
  const supabase = requireServiceRole();
  await supabase.from('email_connections').update({ status }).eq('id', id);
}

export async function markConnectionSynced(id: string): Promise<void> {
  const supabase = requireServiceRole();
  const { error } = await supabase
    .from('email_connections')
    .update({ last_synced_at: new Date().toISOString(), status: 'connected' })
    .eq('id', id);
  if (error) throw new GmailSyncError('upstream', 'Could not record the sync timestamp.');
}

export async function setConnectionAutoSync(id: string, autoSync: boolean): Promise<void> {
  const supabase = requireServiceRole();
  const { error } = await supabase
    .from('email_connections')
    .update({ auto_sync: autoSync })
    .eq('id', id);
  if (error) throw new GmailSyncError('upstream', 'Could not update auto-sync.');
}

/**
 * Disconnects a mailbox: revokes the grant at Google (best effort) and deletes
 * the local row, which drops the ciphertext permanently.
 */
export async function deleteEmailConnection(row: EmailConnectionRow): Promise<void> {
  const supabase = requireServiceRole();
  const accessToken = readAccessToken(row);
  const refreshToken = readRefreshToken(row);
  const { error } = await supabase.from('email_connections').delete().eq('id', row.id);
  if (error) throw new GmailSyncError('upstream', 'Could not disconnect the mailbox.');
  if (accessToken) await revokeGoogleToken(accessToken);
  if (refreshToken) await revokeGoogleToken(refreshToken);
}
