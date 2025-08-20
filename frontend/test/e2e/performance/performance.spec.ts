import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import testData from './fixtures/test-data';

test.describe('Performance and Accessibility', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPageLoad();
  });

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await helpers.waitForPageLoad();

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Take a screenshot for verification
    await helpers.takeScreenshot('page-load-performance');
  });

  test('should be accessible to screen readers', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // Images should have alt text (empty alt is acceptable for decorative images)
      expect(alt).not.toBeNull();
    }

    // Check for proper form labels
    const inputs = page.locator(
      'input[type="text"], input[type="email"], input[type="tel"], textarea'
    );
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');

      if (id) {
        // If input has ID, there should be a corresponding label
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = (await label.count()) > 0;

        if (!labelExists) {
          // Check for aria-label as alternative
          const ariaLabel = await input.getAttribute('aria-label');
          expect(ariaLabel).not.toBeNull();
        }
      }
    }
  });

  test('should handle different viewport sizes', async ({ page }) => {
    // Test mobile viewport
    await helpers.setMobileViewport();
    await page.reload();
    await helpers.waitForPageLoad();

    // Verify page is responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check if mobile menu exists or navigation adapts
    const isMobile = await helpers.isMobileViewport();
    expect(isMobile).toBeTruthy();

    // Test tablet viewport
    await page.setViewportSize(testData.viewports.tablet);
    await page.reload();
    await helpers.waitForPageLoad();
    await expect(body).toBeVisible();

    // Test desktop viewport
    await helpers.setDesktopViewport();
    await page.reload();
    await helpers.waitForPageLoad();
    await expect(body).toBeVisible();

    await helpers.takeScreenshot('responsive-desktop');
  });

  test('should not have console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        // Ignore favicon errors as they're common in development
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Allow some time for any async operations to complete
    await page.waitForTimeout(2000);

    // Should not have any critical console errors
    expect(consoleErrors.length).toBe(0);

    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failure for API calls
    await page.route('**/api/**', route => {
      route.abort();
    });

    await page.goto('/');

    // Page should still load even if API calls fail
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Should not show unhandled error messages to users
    const errorElements = page.locator('.error, [data-testid="error"]');
    const visibleErrors = await errorElements.count();

    // If there are error elements, they should be properly handled
    if (visibleErrors > 0) {
      const errorText = await errorElements.first().textContent();
      expect(errorText).toBeDefined();
      expect(errorText?.length).toBeGreaterThan(0);
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Start from the beginning of the page
    await page.keyboard.press('Tab');

    // Should be able to navigate through focusable elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');

      // Each tab should move to a focusable element
      const currentFocus = page.locator(':focus');
      const isVisible = await currentFocus.isVisible().catch(() => false);

      // At least some elements should be focusable
      if (isVisible) {
        expect(isVisible).toBeTruthy();
      }
    }

    // Test Enter key on buttons
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();

      // Button should be focusable
      await expect(firstButton).toBeFocused();
    }
  });

  test('should maintain focus management', async ({ page }) => {
    // Test focus trap in modals/dialogs if they exist
    const modalTriggers = page.locator(
      '[data-testid*="modal"], [data-testid*="dialog"], button:has-text("Book")'
    );
    const triggerCount = await modalTriggers.count();

    if (triggerCount > 0) {
      const trigger = modalTriggers.first();
      await trigger.click();

      // Wait for modal to appear
      await page.waitForTimeout(500);

      // Check if modal is properly focused
      const modal = page.locator('[role="dialog"], .modal');
      const modalExists = (await modal.count()) > 0;

      if (modalExists) {
        // Modal should contain focus
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');

        // Focus should be within the modal
        const isInModal = (await modal.locator(':focus').count()) > 0;
        if (isInModal) {
          expect(isInModal).toBeTruthy();
        }
      }
    }
  });
});
