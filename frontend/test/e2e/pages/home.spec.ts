import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page successfully', async ({ page }) => {
    // Check that the page title contains the expected text
    await expect(page).toHaveTitle(/WizCuts/);

    // Verify the page loads without major errors
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe('http://localhost:3001/');
  });

  test('should display main navigation elements', async ({ page }) => {
    // Check for common navigation elements that would be expected in a barber shop website
    // These selectors would need to be updated based on actual implementation

    // Check for header/navigation
    const header = page.locator('header, nav, [role="navigation"]').first();
    await expect(header).toBeVisible();

    // Check for main content area
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify the page still loads properly on mobile
    await page.waitForLoadState('networkidle');

    // Check that content is still visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle basic accessibility requirements', async ({ page }) => {
    // Check for basic accessibility landmarks - main, nav, footer
    const main = await page.locator('main').count();
    expect(main).toBeGreaterThan(0);

    const nav = await page.locator('nav').count();
    expect(nav).toBeGreaterThan(0);

    const footer = await page.locator('footer').count();
    expect(footer).toBeGreaterThan(0);

    // Check that the page has a proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
  });
});
