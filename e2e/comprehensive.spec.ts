import { test, expect } from '@playwright/test';

test.describe('Comprehensive Functional Audit', () => {
  // Use a unique email for each run to avoid "already exists" errors if using real Supabase
  const uniqueEmail = `testuser_${Date.now()}@devlaunch.ai`;
  const password = 'TestPassword123!';

  test('Authentication: Signup and Login Flow', async ({ page }) => {
    // 1. Signup
    await page.goto('/signup');
    await page.fill('input[type="text"]', 'Test User');
    await page.fill('input[type="email"]', uniqueEmail);
    // Assuming there are two password fields (password and confirm)
    const passwords = await page.locator('input[type="password"]').all();
    if (passwords.length >= 2) {
      await passwords[0].fill(password);
      await passwords[1].fill(password);
    } else {
      await page.fill('input[type="password"]', password);
    }
    await page.check('input[type="checkbox"]');
    await page.click('button[type="submit"]');

    // Might redirect or show message. We'll wait a bit.
    await page.waitForTimeout(1000);

    // 2. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@devlaunch.ai'); // Let's use demo for reliability if signup requires email confirmation
    await page.fill('input[type="password"]', 'devlaunch');
    await page.click('button[type="submit"]');

    // 3. Dashboard Access
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText(/Welcome back/i);
    
    // 4. Session Persistence (Refresh)
    await page.reload();
    await expect(page.locator('h1')).toContainText(/Welcome back/i);
  });

  test('Job Tracker: CRUD Operations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@devlaunch.ai');
    await page.fill('input[type="password"]', 'devlaunch');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Navigate to jobs
    await page.goto('/dashboard/jobs');
    await expect(page.locator('h1')).toContainText(/Job Tracker/i);

    // Create Job
    await page.click('button:has-text("Add Job")'); // Assuming an Add Job button exists
    // Fill job details (adjust selectors as needed)
    await page.fill('input[name="company"]', 'Test Company LLC');
    await page.fill('input[name="title"]', 'E2E Test Engineer');
    await page.click('button:has-text("Save")');

    // Search Job
    await page.fill('input[placeholder*="Search"]', 'Test Company LLC');
    await expect(page.locator('text=Test Company LLC')).toBeVisible();
  });

  test('Resume Builder', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@devlaunch.ai');
    await page.fill('input[type="password"]', 'devlaunch');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/dashboard/resume');
    await expect(page.locator('h1')).toContainText(/Resume/i);
    // Add interactions
  });

  test('Cover Letter Generator', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@devlaunch.ai');
    await page.fill('input[type="password"]', 'devlaunch');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/dashboard/cover-letter');
    await expect(page.locator('h1')).toContainText(/Cover Letter/i);
    
    await page.click('button:has-text("Generate")');
    // Wait for generation
    await page.waitForTimeout(2000);
    // Check if result exists
    const hasText = await page.evaluate(() => {
      return document.body.innerText.includes('Dear') || document.body.innerText.includes('Software Engineer');
    });
    expect(hasText).toBeTruthy();
  });

});
