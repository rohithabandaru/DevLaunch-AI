import { test, expect } from '@playwright/test';

test.describe('Phase 1 Verification: Middleware Auth & Admin RBAC', () => {
  test('Test A: Unauthenticated user accessing /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Test B: Unauthenticated user accessing /dashboard/admin redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
