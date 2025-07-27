import { Page, expect } from '@playwright/test';

/**
 * Common test utilities for E2E tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the page to fully load including network requests
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Check if an element exists without throwing an error
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      return (await element.count()) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Wait for an element to be visible with a custom timeout
   */
  async waitForElement(selector: string, timeout: number = 10000) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    return element;
  }

  /**
   * Fill a form field and verify the value was set
   */
  async fillAndVerify(selector: string, value: string) {
    await this.page.fill(selector, value);
    const inputValue = await this.page.inputValue(selector);
    expect(inputValue).toBe(value);
  }

  /**
   * Click an element and wait for navigation if it occurs
   */
  async clickAndWaitForNavigation(selector: string) {
    const [response] = await Promise.all([
      this.page.waitForResponse(resp => resp.status() === 200),
      this.page.click(selector),
    ]);
    return response;
  }

  /**
   * Scroll to an element to ensure it's in view
   */
  async scrollToElement(selector: string) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    return element;
  }

  /**
   * Check if the page has any console errors
   */
  async checkForConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];

    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Mock API responses for testing
   */
  async mockApiResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Wait for a specific text to appear on the page
   */
  async waitForText(text: string, timeout: number = 10000) {
    const element = this.page.locator(`text=${text}`);
    await expect(element).toBeVisible({ timeout });
    return element;
  }

  /**
   * Check if the current page URL matches a pattern
   */
  async expectUrl(pattern: string | RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  /**
   * Get the current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if page is mobile viewport
   */
  async isMobileViewport(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  /**
   * Set mobile viewport
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Set desktop viewport
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  /**
   * Clear all form inputs on the page
   */
  async clearAllInputs() {
    const inputs = this.page.locator('input, textarea');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      await inputs.nth(i).clear();
    }
  }

  /**
   * Check if page has loading indicators
   */
  async waitForLoadingToComplete() {
    // Wait for common loading indicators to disappear
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-testid="loading"]',
      '.skeleton',
    ];

    for (const selector of loadingSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();

      if (count > 0) {
        await expect(elements.first()).toBeHidden({ timeout: 30000 });
      }
    }
  }
}
