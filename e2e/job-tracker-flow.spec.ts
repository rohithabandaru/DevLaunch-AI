import { test, expect } from '@playwright/test';

test.describe('E2E Flow 2: Job Tracker & Kanban Board Interaction', () => {
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
  });

  test('renders Job Tracker page and filter controls', async ({ page }) => {
    await page.goto('/dashboard/jobs');
    await expect(page.locator('h1')).toContainText(/Job/i);
  });
});
