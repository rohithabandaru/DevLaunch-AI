import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

const BASE = 'http://localhost:3000';

/**
 * Security regression tests for the hardened API routes.
 *
 * These cover the fail-closed, unauthenticated behavior that must hold without
 * any server state. Authenticated flows (vulnerability-class tests that need a
 * real Supabase session + seeded user_roles) are documented in the final report
 * as requiring a live backend and are verified by unit tests + code audits.
 */

test.describe('Hardened API security (unauthenticated)', () => {
  async function post(request: APIRequestContext, path: string, init?: Parameters<typeof request.post>[1]) {
    return request.post(`${BASE}${path}`, init);
  }

  test('V-3: /api/ai/generate rejects unauthenticated requests with 401', async ({ request }) => {
    const res = await post(request, '/api/ai/generate', { data: { prompt: 'hello' } });
    expect(res.status()).toBe(401);
  });

  test('V-4: /api/extension/clip rejects unauthenticated requests with 401 (no demo-user fallback)', async ({ request }) => {
    const res = await post(request, '/api/extension/clip', {
      data: { company: 'Stripe', title: 'Engineer' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Authentication required');
  });

  test('V-4: /api/extension/clip rejects forged Bearer tokens with 401', async ({ request }) => {
    const res = await post(request, '/api/extension/clip', {
      headers: { Authorization: 'Bearer forged-token-value' },
      data: { company: 'Stripe', title: 'Engineer' },
    });
    expect(res.status()).toBe(401);
  });

  test('V-4: extension clip OPTIONS preflight requires a valid extension origin', async ({ request }) => {
    const res = await request.fetch(`${BASE}/api/extension/clip`, { method: 'OPTIONS' });
    expect(res.status()).toBe(204);
    expect(res.headers()['access-control-allow-origin']).toBeUndefined();
  });

  test('/api/auth/me rejects unauthenticated requests with 401', async ({ request }) => {
    const res = await request.get(`${BASE}/api/auth/me`);
    expect(res.status()).toBe(401);
  });

  test('V-2: /dashboard/admin redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});