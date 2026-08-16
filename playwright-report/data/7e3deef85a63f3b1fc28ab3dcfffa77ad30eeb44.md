# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comprehensive.spec.ts >> Comprehensive Functional Audit >> Resume Builder
- Location: e2e\comprehensive.spec.ts:66:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
  navigated to "http://localhost:3000/login"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link "DevLaunch AI" [ref=e5] [cursor=pointer]:
        - /url: /
      - generic [ref=e11]: Executive career suite for developers
      - heading "Land your dream role with AI Intelligence" [level=1] [ref=e15]
      - paragraph [ref=e16]: Build ATS-optimized resumes, publish sleek portfolio websites, analyze keyword coverage, and generate personalized cover letters — in minutes.
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: 35 Resume Templates
          - paragraph [ref=e23]: ATS-friendly, Modern, Executive, Developer, Timeline & more.
        - generic [ref=e24]:
          - generic [ref=e25]: 15 Portfolio Themes
          - paragraph [ref=e29]: Glassmorphic, Developer Dark, Neon, & Minimalist visual themes.
        - generic [ref=e30]:
          - generic [ref=e31]: ATS Scoring & Match
          - paragraph [ref=e35]: Instant feedback with keyword gap analysis and formatting suggestions.
        - generic [ref=e36]:
          - generic [ref=e37]: AI Copywriter Engine
          - paragraph [ref=e41]: Powered by OpenAI for summary, bullet points, and cover letters.
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]: 🧑‍💻
          - generic [ref=e45]: 👩‍💼
          - generic [ref=e46]: 👨‍🎨
          - generic [ref=e47]: 👩‍🔬
        - paragraph [ref=e48]: 2,400+ developers already building with DevLaunch AI
    - generic [ref=e49]:
      - generic [ref=e50]:
        - button "Login" [ref=e51]
        - button "Sign Up" [ref=e52]
        - button "Forgot Password" [ref=e53]
      - generic [ref=e54]:
        - heading "Welcome back" [level=2] [ref=e55]
        - paragraph [ref=e56]: Sign in to your DevLaunch AI dashboard.
      - button "Sign in with Google" [ref=e57]
      - generic [ref=e63]: Or with email
      - generic [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]: Email Address
          - textbox "name@domain.com" [ref=e73]: demo@devlaunch.ai
        - generic [ref=e74]:
          - generic [ref=e75]: Password
          - generic [ref=e79]:
            - textbox "••••••••" [ref=e80]: devlaunch
            - button [ref=e81]
        - button "Forgot password?" [ref=e86]
        - button "Sign In" [ref=e87]
        - generic [ref=e91]: Invalid login credentials
      - generic [ref=e92]:
        - paragraph [ref=e93]:
          - text: Don't have an account?
          - link "Sign up for free" [ref=e94] [cursor=pointer]:
            - /url: /signup
        - paragraph [ref=e95]:
          - link "← Return to Landing Page" [ref=e96] [cursor=pointer]:
            - /url: /
  - generic [ref=e97]:
    - generic:
      - link:
        - /url: https://wa.me/919178400000?text=Hi!%20I%20have%20a%20question%20about%20DevLaunch%20AI.
      - link:
        - /url: mailto:support@devlaunch.ai?subject=DevLaunch%20AI%20%E2%80%94%20Support%20Request
      - link:
        - /url: tel:+919178400000
    - button "Open contact menu" [ref=e98]
  - button "Open Next.js Dev Tools" [ref=e108] [cursor=pointer]
  - alert [ref=e112]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Comprehensive Functional Audit', () => {
  4  |   // Use a unique email for each run to avoid "already exists" errors if using real Supabase
  5  |   const uniqueEmail = `testuser_${Date.now()}@devlaunch.ai`;
  6  |   const password = 'TestPassword123!';
  7  | 
  8  |   test('Authentication: Signup and Login Flow', async ({ page }) => {
  9  |     // 1. Signup
  10 |     await page.goto('/signup');
  11 |     await page.fill('input[type="text"]', 'Test User');
  12 |     await page.fill('input[type="email"]', uniqueEmail);
  13 |     // Assuming there are two password fields (password and confirm)
  14 |     const passwords = await page.locator('input[type="password"]').all();
  15 |     if (passwords.length >= 2) {
  16 |       await passwords[0].fill(password);
  17 |       await passwords[1].fill(password);
  18 |     } else {
  19 |       await page.fill('input[type="password"]', password);
  20 |     }
  21 |     await page.check('input[type="checkbox"]');
  22 |     await page.click('button[type="submit"]');
  23 | 
  24 |     // Might redirect or show message. We'll wait a bit.
  25 |     await page.waitForTimeout(1000);
  26 | 
  27 |     // 2. Login
  28 |     await page.goto('/login');
  29 |     await page.fill('input[type="email"]', 'demo@devlaunch.ai'); // Let's use demo for reliability if signup requires email confirmation
  30 |     await page.fill('input[type="password"]', 'devlaunch');
  31 |     await page.click('button[type="submit"]');
  32 | 
  33 |     // 3. Dashboard Access
  34 |     await page.waitForURL('**/dashboard');
  35 |     await expect(page.locator('h1')).toContainText(/Welcome back/i);
  36 |     
  37 |     // 4. Session Persistence (Refresh)
  38 |     await page.reload();
  39 |     await expect(page.locator('h1')).toContainText(/Welcome back/i);
  40 |   });
  41 | 
  42 |   test('Job Tracker: CRUD Operations', async ({ page }) => {
  43 |     // Login first
  44 |     await page.goto('/login');
  45 |     await page.fill('input[type="email"]', 'demo@devlaunch.ai');
  46 |     await page.fill('input[type="password"]', 'devlaunch');
  47 |     await page.click('button[type="submit"]');
  48 |     await page.waitForURL('**/dashboard');
  49 | 
  50 |     // Navigate to jobs
  51 |     await page.goto('/dashboard/jobs');
  52 |     await expect(page.locator('h1')).toContainText(/Job Tracker/i);
  53 | 
  54 |     // Create Job
  55 |     await page.click('button:has-text("Add Job")'); // Assuming an Add Job button exists
  56 |     // Fill job details (adjust selectors as needed)
  57 |     await page.fill('input[name="company"]', 'Test Company LLC');
  58 |     await page.fill('input[name="title"]', 'E2E Test Engineer');
  59 |     await page.click('button:has-text("Save")');
  60 | 
  61 |     // Search Job
  62 |     await page.fill('input[placeholder*="Search"]', 'Test Company LLC');
  63 |     await expect(page.locator('text=Test Company LLC')).toBeVisible();
  64 |   });
  65 | 
  66 |   test('Resume Builder', async ({ page }) => {
  67 |     await page.goto('/login');
  68 |     await page.fill('input[type="email"]', 'demo@devlaunch.ai');
  69 |     await page.fill('input[type="password"]', 'devlaunch');
  70 |     await page.click('button[type="submit"]');
> 71 |     await page.waitForURL('**/dashboard');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  72 | 
  73 |     await page.goto('/dashboard/resume');
  74 |     await expect(page.locator('h1')).toContainText(/Resume/i);
  75 |     // Add interactions
  76 |   });
  77 | 
  78 |   test('Cover Letter Generator', async ({ page }) => {
  79 |     await page.goto('/login');
  80 |     await page.fill('input[type="email"]', 'demo@devlaunch.ai');
  81 |     await page.fill('input[type="password"]', 'devlaunch');
  82 |     await page.click('button[type="submit"]');
  83 |     await page.waitForURL('**/dashboard');
  84 | 
  85 |     await page.goto('/dashboard/cover-letter');
  86 |     await expect(page.locator('h1')).toContainText(/Cover Letter/i);
  87 |     
  88 |     await page.click('button:has-text("Generate")');
  89 |     // Wait for generation
  90 |     await page.waitForTimeout(2000);
  91 |     // Check if result exists
  92 |     const hasText = await page.evaluate(() => {
  93 |       return document.body.innerText.includes('Dear') || document.body.innerText.includes('Software Engineer');
  94 |     });
  95 |     expect(hasText).toBeTruthy();
  96 |   });
  97 | 
  98 | });
  99 | 
```