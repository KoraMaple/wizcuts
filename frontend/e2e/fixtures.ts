import { test as base, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

// Extend Playwright test with custom fixtures
export const test = base.extend<{
  helpers: TestHelpers;
  bookingPage: BookingPage;
}>({
  // Auto-initialize test helpers for every test
  helpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },

  // Custom page object for booking functionality
  bookingPage: async ({ page, helpers }, use) => {
    const bookingPage = new BookingPage(page, helpers);
    await use(bookingPage);
  },
});

export { expect } from '@playwright/test';

/**
 * Example Page Object for Booking functionality
 * This demonstrates how to create reusable page objects
 */
class BookingPage {
  constructor(
    private page: any,
    private helpers: TestHelpers
  ) {}

  async navigateToBooking() {
    await this.page.goto('/booking');
    await this.helpers.waitForPageLoad();
  }

  async fillCustomerInfo(name: string, email: string, phone?: string) {
    await this.helpers.fillAndVerify('[name="customerName"]', name);
    await this.helpers.fillAndVerify('[name="email"]', email);
    
    if (phone) {
      await this.helpers.fillAndVerify('[name="phone"]', phone);
    }
  }

  async selectService(serviceName: string) {
    const serviceSelector = `[data-testid="service-${serviceName}"], button:has-text("${serviceName}")`;
    const serviceElement = await this.helpers.waitForElement(serviceSelector);
    await serviceElement.click();
  }

  async selectBarber(barberName: string) {
    const barberSelector = `[data-testid="barber-${barberName}"], button:has-text("${barberName}")`;
    const barberElement = await this.helpers.waitForElement(barberSelector);
    await barberElement.click();
  }

  async selectDateTime(date: string, time: string) {
    // This would be customized based on actual date/time picker implementation
    await this.page.fill('[name="date"]', date);
    await this.page.selectOption('[name="time"]', time);
  }

  async submitBooking() {
    const submitButton = this.page.locator('button[type="submit"], [data-testid="submit-booking"]');
    await submitButton.click();
    
    // Wait for submission to complete
    await this.helpers.waitForLoadingToComplete();
  }

  async getConfirmationMessage() {
    const confirmationSelector = '.confirmation, [data-testid="confirmation"], .success';
    const element = await this.helpers.waitForElement(confirmationSelector);
    return await element.textContent();
  }

  async expectBookingSuccess() {
    const confirmationMessage = await this.getConfirmationMessage();
    expect(confirmationMessage).toContain('confirmed');
  }
}

// Example usage in a test file:
// import { test, expect } from './fixtures';
// 
// test('should complete booking flow', async ({ bookingPage, helpers }) => {
//   await bookingPage.navigateToBooking();
//   await bookingPage.fillCustomerInfo('John Doe', 'john@example.com');
//   await bookingPage.selectService('Haircut');
//   await bookingPage.selectBarber('Mike');
//   await bookingPage.selectDateTime('2024-01-15', '10:00');
//   await bookingPage.submitBooking();
//   await bookingPage.expectBookingSuccess();
// });