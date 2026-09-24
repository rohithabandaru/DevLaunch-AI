import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import { getAuthoritativeRole, type AppRole } from './authorization';

export const EXTENSION_TOKEN_TTL_MS = 10 * 60 * 1000;
export const EXTENSION_TOKEN_TTL_SECONDS = EXTENSION_TOKEN_TTL_MS / 1000;

export function getSupabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || null;
}

export function getSupabaseAnonKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/**
 * Creates the cookie-based Supabase client bound to the current request session.
 * Reads the authenticated user through `auth.getUser()` (validates the JWT
 * server-side) and executes queries with the user's own privileges + RLS.
 */
export async function getServerSupabase() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl() as string, getSupabaseAnonKey() as string, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Cookie mutation from a read-only context is a no-op; the session is
          // still valid for reading.
        }
      },
    },
  });
}

/** The authenticated user from the trusted server-side session, or null. */
export async function getSessionUser() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export interface SessionIdentity {
  id: string;
  email: string;
  role: AppRole;
}

/** Authenticated identity plus the authoritative, server-controlled role. */
export async function getSessionIdentity(): Promise<SessionIdentity | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const user = await getSessionUser();
  if (!user) return null;
  const role = await getAuthoritativeRole(user.id, supabase);
  return { id: user.id, email: user.email || '', role };
}

/** Server-only Supabase client using the service role key (RLS bypass). */
export function getServiceRoleClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function hashExtensionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateExtensionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Mints a short-lived, single-use extension session token bound to the given
 * authenticated user. The raw token is returned to the caller exactly once;
 * only its SHA-256 hash is persisted server-side.
 */
export async function createExtensionSessionToken(userId: string): Promise<string | null> {
  const serviceRole = getServiceRoleClient();
  if (!serviceRole) return null;
  const token = generateExtensionToken();
  const { error } = await serviceRole.from('extension_sessions').insert({
    user_id: userId,
    token_hash: hashExtensionToken(token),
    expires_at: new Date(Date.now() + EXTENSION_TOKEN_TTL_MS).toISOString(),
  });
  if (error) return null;
  return token;
}

/**
 * Redeems a single-use extension session token and returns the owning user id.
 * Enforces: hash lookup, not already used, not expired. Marks the token used
 * atomically-ish (single server instance) so it cannot be replayed.
 */
export async function redeemExtensionSessionToken(token: string): Promise<string | null> {
  if (!token || token.length < 32) return null;
  const serviceRole = getServiceRoleClient();
  if (!serviceRole) return null;

  const {
    data,
    error,
  } = await serviceRole
    .from('extension_sessions')
    .select('id, user_id, used_at, expires_at')
    .eq('token_hash', hashExtensionToken(token))
    .maybeSingle();

  if (error || !data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  const { error: updateError } = await serviceRole
    .from('extension_sessions')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id);
  if (updateError) return null;

  return String(data.user_id);
}