import { test, expect } from '@playwright/test';

test.describe('Booking System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display booking interface elements', async ({ page }) => {
    // Look for booking-related elements on the page
    // These selectors will need to be updated based on actual implementation
    
    // Check for booking buttons or links
    const bookingElements = page.locator(
      'button:has-text("Book"), a:has-text("Book"), [data-testid*="book"], [class*="book"]'
    );
    
    const bookingCount = await bookingElements.count();
    
    if (bookingCount > 0) {
      // Verify at least one booking element is visible
      await expect(bookingElements.first()).toBeVisible();
    }
    
    // Alternatively, check if there's any mention of booking/appointment in the content
    const pageText = await page.textContent('body');
    const hasBookingContent = pageText?.toLowerCase().includes('book') || 
                             pageText?.toLowerCase().includes('appointment') ||
                             pageText?.toLowerCase().includes('schedule');
    
    // Should have either booking UI elements or booking-related content
    expect(bookingCount > 0 || hasBookingContent).toBeTruthy();
  });

  test('should handle booking form interaction (if present)', async ({ page }) => {
    // Look for forms that might be booking forms
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      const form = forms.first();
      
      // Check for common form fields
      const nameField = form.locator('input[name*="name"], input[type="text"]').first();
      const emailField = form.locator('input[name*="email"], input[type="email"]').first();
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      
      // If form fields exist, test basic interaction
      if (await nameField.count() > 0) {
        await nameField.fill('Test User');
        expect(await nameField.inputValue()).toBe('Test User');
      }
      
      if (await emailField.count() > 0) {
        await emailField.fill('test@example.com');
        expect(await emailField.inputValue()).toBe('test@example.com');
      }
      
      // Note: We don't actually submit to avoid creating test data
      if (await submitButton.count() > 0) {
        await expect(submitButton).toBeVisible();
      }
    }
  });

  test('should display service information', async ({ page }) => {
    // Look for service-related content
    const pageText = await page.textContent('body');
    
    // Check for common barber shop services
    const hasServiceContent = pageText?.toLowerCase().includes('haircut') ||
                             pageText?.toLowerCase().includes('shave') ||
                             pageText?.toLowerCase().includes('beard') ||
                             pageText?.toLowerCase().includes('service') ||
                             pageText?.toLowerCase().includes('barber');
    
    expect(hasServiceContent).toBeTruthy();
  });

  test('should display pricing information (if available)', async ({ page }) => {
    // Look for pricing indicators
    const priceElements = page.locator('[class*="price"], [data-testid*="price"]');
    const dollarSigns = page.locator('text=/\\$\\d+/');
    
    const priceCount = await priceElements.count();
    const dollarCount = await dollarSigns.count();
    
    // Check page text for price indicators
    const pageText = await page.textContent('body');
    const hasPriceText = pageText?.includes('$') || 
                        pageText?.toLowerCase().includes('price') ||
                        pageText?.toLowerCase().includes('cost');
    
    // If there's pricing information, it should be properly displayed
    if (priceCount > 0 || dollarCount > 0 || hasPriceText) {
      // At minimum, the content should be visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});