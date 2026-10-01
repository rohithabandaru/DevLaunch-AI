import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock('@/lib/authorization', () => ({
  getAuthoritativeRole: vi.fn(),
}));

import { createServerClient } from '@supabase/ssr';
import { getAuthoritativeRole } from '@/lib/authorization';

describe('Next.js Proxy Middleware (Auth Guard)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://valid-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'valid-anon-key-1234567890',
      NODE_ENV: 'production',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('allows public routes without authentication', async () => {
    const req = new NextRequest('http://localhost:3000/');
    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('blocks unauthenticated requests to /dashboard in production', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser: mockGetUser },
    } as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?next=%2Fdashboard');
  });

  it('BLOCKS devlaunch_demo_session=1 cookie in production mode', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser: mockGetUser },
    } as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'devlaunch_demo_session=1',
      },
    });

    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?next=%2Fdashboard');
  });

  it('allows authenticated users to access /dashboard', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: mockUser } });
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser: mockGetUser },
    } as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('blocks non-admin users from accessing /dashboard/admin', async () => {
    const mockUser = { id: 'user-123', email: 'user@example.com' };
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: mockUser } });
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser: mockGetUser },
    } as unknown as ReturnType<typeof createServerClient>);
    vi.mocked(getAuthoritativeRole).mockResolvedValue('user');

    const req = new NextRequest('http://localhost:3000/dashboard/admin');
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('allows admin users to access /dashboard/admin', async () => {
    const mockAdmin = { id: 'admin-123', email: 'admin@example.com' };
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: mockAdmin } });
    vi.mocked(createServerClient).mockReturnValue({
      auth: { getUser: mockGetUser },
    } as unknown as ReturnType<typeof createServerClient>);
    vi.mocked(getAuthoritativeRole).mockResolvedValue('admin');

    const req = new NextRequest('http://localhost:3000/dashboard/admin');
    const res = await proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
