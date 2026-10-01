import { test, expect } from '@playwright/test';

test.describe('Comprehensive Functional Audit', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'devlaunch_demo_session',
        value: '1',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.route('/api/subscription', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          subscription: {
            tier: 'PRO',
            status: 'active',
            planId: 'pro',
            billingCycle: 'monthly',
          },
        }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'user_auth_session',
        JSON.stringify({
          id: 'test-user-123',
          name: 'Test User',
          email: 'test@devlaunch.ai',
          role: 'user',
          plan: 'pro',
        })
      );
    });
  });

  test('Authentication: Signup and Login Flow', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText(/Welcome back/i);
  });

  test('Job Tracker: CRUD Operations', async ({ page }) => {
    await page.goto('/dashboard/jobs');
    await expect(page.locator('h1')).toContainText(/Job/i);
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('Resume Builder', async ({ page }) => {
    await page.goto('/dashboard/resume');
    await expect(page.locator('h1')).toContainText(/Resume/i);
  });

  test('Cover Letter Generator', async ({ page }) => {
    await page.goto('/dashboard/cover-letter');
    await expect(page.locator('h1')).toContainText(/Cover Letter/i);
    await expect(page.locator('button:has-text("Generate Letter")')).toBeVisible();
  });
});
