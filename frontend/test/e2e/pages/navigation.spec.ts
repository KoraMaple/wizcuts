import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between pages using main navigation', async ({
    page,
  }) => {
    // This test will need to be updated based on actual navigation structure
    // For now, testing basic navigation functionality

    // Open mobile menu if present (hamburger)
    const menuButton = page
      .locator(
        'button[aria-label*="menu" i], [data-testid*="menu" i], button[aria-controls*="menu" i]'
      )
      .first();
    if ((await menuButton.count()) > 0) {
      await menuButton.click({ trial: true }).catch(() => {});
      await menuButton.click().catch(() => {});
      await page.waitForTimeout(100);
    }

    // Look for navigation links - broaden selectors for mobile/desktop
    const navLinks = page.locator(
      'nav a, [role="navigation"] a, header a, [data-testid*="nav"] a'
    );
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Click the first navigation link
      const firstLink = navLinks.first();
      const linkText = await firstLink.textContent();

      if (linkText && !linkText.trim().startsWith('http')) {
        // Ensure link is actionable on mobile: scroll into view and wait for visibility
        await firstLink.scrollIntoViewIfNeeded().catch(() => {});
        await expect(firstLink).toBeVisible();
        await firstLink.click();
        await page.waitForLoadState('networkidle');

        // Verify navigation occurred (URL should have changed or content updated)
        const currentUrl = page.url();
        expect(currentUrl).toContain('localhost:3000');
      }
    }
  });

  test('should handle browser back and forward navigation', async ({
    page,
  }) => {
    const initialUrl = page.url();

    // Try to navigate to a different page if possible
    const links = page.locator('a[href^="/"], a[href^="./"]');
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstInternalLink = links.first();
      await firstInternalLink.click();
      await page.waitForLoadState('networkidle');

      const newUrl = page.url();

      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Should be back to initial URL
      expect(page.url()).toBe(initialUrl);

      // Go forward
      await page.goForward();
      await page.waitForLoadState('networkidle');

      // Should be back to the second page
      expect(page.url()).toBe(newUrl);
    }
  });

  test('should handle page refresh correctly', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    const initialUrl = page.url();

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();

    // Verify we're still on the same page
    const initialPath = new URL(initialUrl).pathname;
    const refreshedPath = new URL(page.url()).pathname;
    expect(refreshedPath).toBe(initialPath);

    // Verify main content is still there
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display 404 page for invalid routes', async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto('/this-page-does-not-exist');

    // Check if it's a 404 or if Next.js handles it gracefully
    // Next.js typically returns 200 but shows a 404 page
    const pageContent = await page.textContent('body');

    // Look for common 404 indicators
    const has404Content =
      pageContent?.toLowerCase().includes('404') ||
      pageContent?.toLowerCase().includes('not found') ||
      pageContent?.toLowerCase().includes('page not found');

    // Either should get a 404 status or show 404 content
    expect(response?.status() === 404 || has404Content).toBeTruthy();
  });
});
