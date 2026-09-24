import type { SupabaseClient } from '@supabase/supabase-js';

export type AppRole = 'user' | 'admin';

export type RoleRow = { role: string | null };

/**
 * Reads the authoritative application role for a user from the server-side
 * `public.user_roles` table, keyed to the trusted `auth.uid()`.
 *
 * Client-controlled metadata is NEVER consulted here. On any lookup error the
 * caller fails CLOSED (returns 'user'), so a broken/absent role record can
 * never accidentally escalate privileges.
 */
export async function getAuthoritativeRole(
  userId: string,
  supabase: SupabaseClient
): Promise<AppRole> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle<RoleRow>();

    if (error || !data) return 'user';
    return data.role === 'admin' ? 'admin' : 'user';
  } catch {
    return 'user';
  }
}

export function isAdminRole(role: AppRole): boolean {
  return role === 'admin';
}