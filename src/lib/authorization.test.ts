import { describe, it, expect, vi } from 'vitest';
import { getAuthoritativeRole, isAdminRole, type AppRole } from './authorization';
import type { SupabaseClient } from '@supabase/supabase-js';

function makeSupabase(maybeSingleResult: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(maybeSingleResult);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return {
    supabase: { from } as unknown as SupabaseClient,
    fromSpy: from,
    eqSpy: eq,
    maybeSingleSpy: maybeSingle,
  };
}

function mockRoleRow(rows: unknown[]) {
  return makeSupabase({ data: rows.length ? rows[0] : null, error: null });
}

describe('getAuthoritativeRole', () => {
  it('returns "admin" when a user_roles row exists with role admin', async () => {
    const { supabase, fromSpy } = mockRoleRow([{ role: 'admin' }]);
    expect(await getAuthoritativeRole('user-1', supabase)).toBe('admin');
    expect(fromSpy).toHaveBeenCalledWith('user_roles');
  });

  it('returns "user" when the role row says user', async () => {
    const { supabase } = mockRoleRow([{ role: 'user' }]);
    expect(await getAuthoritativeRole('user-1', supabase)).toBe('user');
  });

  it('fails closed to "user" when no role row exists', async () => {
    const { supabase } = mockRoleRow([]);
    expect(await getAuthoritativeRole('user-1', supabase)).toBe('user');
  });

  it('fails closed to "user" on query error', async () => {
    const { supabase } = makeSupabase({ data: null, error: { message: 'boom' } });
    expect(await getAuthoritativeRole('user-1', supabase)).toBe('user');
  });

  it('ignores a client-controllable role value from elsewhere (no metadata consulted)', async () => {
    const { supabase, fromSpy } = mockRoleRow([{ role: 'admin' }]);
    // Regression guard: the authoritative helper must not accept a caller
    // supplied role. Passing one here must be a type error.
    // @ts-expect-error - server must never take a role string from the caller
    await getAuthoritativeRole('user-1', supabase, 'admin');
    expect(fromSpy).toHaveBeenCalledWith('user_roles');
  });
});

describe('isAdminRole', () => {
  it('only recognizes the exact "admin" string', () => {
    expect(isAdminRole('admin')).toBe(true);
    expect(isAdminRole('user')).toBe(false);
    expect(isAdminRole('ADMIN' as AppRole)).toBe(false);
    expect(isAdminRole('' as AppRole)).toBe(false);
    expect(isAdminRole(undefined as unknown as AppRole)).toBe(false);
  });
});