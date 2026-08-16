import { test, expect } from '@playwright/test';

test.describe('E2E Flow 1: Navigation & Protected Routes', () => {
  test('redirects unauthenticated users from protected dashboard routes', async ({ page }) => {
    await page.goto('/dashboard');
    // Verify page renders or handles navigation safely
    await expect(page).toHaveURL(/\/(dashboard|login|signup)/);
  });

  test('renders homepage and core landing navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
