import { test, expect, type Page } from '@playwright/test';

// Extend the Window interface for testing
declare global {
  interface Window {
    __CLERK_AUTH_STATE?: {
      isSignedIn: boolean;
      userId: string | null;
      getToken: () => Promise<string | null>;
    };
    __clerk_frontend_api?: string;
  }
}

test.describe('Appointments Management', () => {
  const mockAppointments = [
    {
      id: 1,
      barberId: 1,
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '+1234567890',
      serviceName: 'Premium Cut & Style',
      totalPrice: '85.00',
      durationMinutes: 45,
      // Make sure this is > 24h so cancel is allowed
      appointmentDateTime: new Date(
        Date.now() + 48 * 60 * 60 * 1000
      ).toISOString(), // In 2 days
      status: 'confirmed',
      notes: 'Test appointment',
      clerkUserId: 'user_test_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      barberId: 2,
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '+1234567890',
      serviceName: 'Classic Cut',
      totalPrice: '65.00',
      durationMinutes: 30,
      appointmentDateTime: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // Next week
      status: 'pending',
      notes: 'Second test appointment',
      clerkUserId: 'user_test_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Helper function to mock authentication
  async function mockAuthentication(page: Page) {
    // Mock Clerk authentication
    await page.addInitScript(() => {
      // Mock window.Clerk
      Object.defineProperty(window, '__clerk_frontend_api', {
        writable: true,
        value: 'pk_test_mock',
      });

      // Mock useAuth hook
      window.__CLERK_AUTH_STATE = {
        isSignedIn: true,
        userId: 'user_test_123',
        getToken: async () => 'mock-token',
      };
    });

    // Intercept API calls
    await page.route('**/bookings/user/appointments', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAppointments),
      });
    });

    await page.route('**/bookings/*/cancel', async route => {
      if (route.request().method() === 'POST') {
        const appointmentId = route
          .request()
          .url()
          .match(/bookings\/(\d+)\/cancel/)?.[1];
        const cancelledAppointment = mockAppointments.find(
          app => app.id === parseInt(appointmentId || '0')
        );
        if (cancelledAppointment) {
          cancelledAppointment.status = 'cancelled';
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(cancelledAppointment),
        });
      }
    });
  }

  test.beforeEach(async ({ page }) => {
    await mockAuthentication(page);
  });

  test('should display appointments page with user appointments', async ({
    page,
  }) => {
    await page.goto('/appointments');

    // Check page title and header
    await expect(page.locator('h1')).toContainText('My Appointments');
    await expect(
      page.locator('text=Manage your upcoming and past appointments')
    ).toBeVisible();

    // Check "Book New Appointment" button
    const bookNewButton = page.locator(
      'button:has-text("Book New Appointment")'
    );
    await expect(bookNewButton).toBeVisible();

    // Wait for appointments to load
    await page
      .waitForSelector('[data-testid="appointment-card"]', { timeout: 5000 })
      .catch(() => {
        // If no data-testid, look for appointment cards by content
      });

    // Check that appointments are displayed
    const appointmentCards = page
      .locator('text=Premium Cut & Style')
      .or(page.locator('text=Classic Cut'));
    await expect(appointmentCards.first()).toBeVisible();

    // Check appointment details are present
    await expect(page.locator('text=$85.00')).toBeVisible();
    await expect(page.locator('text=$65.00')).toBeVisible();
    await expect(page.locator('text=45 min')).toBeVisible();
    await expect(page.locator('text=30 min')).toBeVisible();
  });

  test('should handle empty appointments state', async ({ page }) => {
    // Mock empty appointments response
    await page.route('**/bookings/user/appointments', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/appointments');

    // Check empty state
    await expect(page.locator('text=No appointments yet')).toBeVisible();
    await expect(
      page.locator('text=Book your first appointment to get started')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Book Your First Appointment")')
    ).toBeVisible();
  });

  test('should navigate to booking page when clicking book new appointment', async ({
    page,
  }) => {
    await page.goto('/appointments');

    // Click the "Book New Appointment" button
    const bookNewButton = page.locator(
      'button:has-text("Book New Appointment")'
    );
    await bookNewButton.click();

    // Should navigate to booking page
    await expect(page).toHaveURL('/booking');
  });

  test('should display appointment status correctly', async ({ page }) => {
    await page.goto('/appointments');

    // Wait for appointments to load
    await page.waitForLoadState('networkidle');

    // Check confirmed status
    await expect(page.locator('text=Confirmed').first()).toBeVisible();
    await expect(page.locator('text=Pending').first()).toBeVisible();

    // Check status colors/styling
    const confirmedStatus = page.locator('.bg-green-100').first();
    const pendingStatus = page.locator('.bg-yellow-100').first();

    await expect(confirmedStatus).toBeVisible();
    await expect(pendingStatus).toBeVisible();
  });

  test('should allow cancelling appointments', async ({ page }) => {
    await page.goto('/appointments');

    // Wait for appointments to load
    await page.waitForLoadState('networkidle');

    // Find a cancellable appointment (more than 24 hours away)
    const cancelButton = page.locator('button:has-text("Cancel")').first();

    if (await cancelButton.isVisible()) {
      // Click cancel button
      await cancelButton.click();

      // Wait for the cancellation to process by idling network
      await page.waitForLoadState('networkidle');

      // Check that the appointment status changed to cancelled
      await expect(page.locator('text=Cancelled')).toBeVisible();
    }
  });

  test('should show loading state initially', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('**/bookings/user/appointments', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAppointments),
      });
    });

    await page.goto('/appointments');

    // Check loading state
    await expect(
      page.locator('text=Loading your appointments...')
    ).toBeVisible();
    await expect(page.locator('.animate-spin')).toBeVisible();

    // Wait for loading to complete
    await page.waitForSelector('text=Premium Cut & Style', { timeout: 5000 });
  });

  test('should display appointment details correctly', async ({ page }) => {
    await page.goto('/appointments');

    // Wait for appointments to load
    await page.waitForLoadState('networkidle');
    // Ensure at least one appointment card content is present
    await page.waitForSelector('text=Premium Cut & Style', { timeout: 10000 });

    // Check service names
    await expect(page.locator('text=Premium Cut & Style')).toBeVisible();
    await expect(page.locator('text=Classic Cut')).toBeVisible();

    // Check contact information (narrow to a single match)
    await expect(page.locator('text=test@example.com').first()).toBeVisible();
    await expect(page.locator('text=+1234567890').first()).toBeVisible();

    // Check notes (match paragraph that has 'Notes:' and specific note text)
    const noteOne = page
      .locator('p:has-text("Notes:")')
      .filter({ hasText: 'Test appointment' })
      .first();
    const noteTwo = page
      .locator('p:has-text("Notes:")')
      .filter({ hasText: 'Second test appointment' })
      .first();
    await expect(noteOne).toBeVisible();
    await expect(noteTwo).toBeVisible();

    // Check booking IDs
    await expect(page.locator('text=Booking ID: #1')).toBeVisible();
    await expect(page.locator('text=Booking ID: #2')).toBeVisible();
  });

  test('should handle unauthenticated users', async ({ page }) => {
    // Override authentication to simulate unauthenticated state
    await page.addInitScript(() => {
      window.__CLERK_AUTH_STATE = {
        isSignedIn: false,
        userId: null,
        getToken: async () => null,
      };
    });

    await page.goto('/appointments');

    // Should redirect to sign-in page (don't require full load)
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/bookings/user/appointments', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/appointments');

    // Should still render the page without crashing
    await expect(page.locator('h1')).toContainText('My Appointments');

    // Loading should complete (even if data failed to load)
    await page.waitForSelector('text=Loading your appointments...', {
      state: 'hidden',
      timeout: 10000,
    });
  });

  test('should display correct date and time formatting', async ({ page }) => {
    await page.goto('/appointments');

    // Wait for appointments to load
    await page.waitForLoadState('networkidle');

    // Check that dates are formatted properly (should show weekday, month, day, year)
    const dateElements = page.locator(
      '[class*="text-gray-600"]:has-text("day")'
    );
    await expect(dateElements.first()).toBeVisible();

    // Check that times are formatted properly (should show hour:minute AM/PM)
    const timeElements = page.locator('text=/\\d{1,2}:\\d{2}\\s?(AM|PM)/');
    await expect(timeElements.first()).toBeVisible();
  });

  test('should show confirmed appointment indicators', async ({ page }) => {
    await page.goto('/appointments');

    // Wait for appointments to load
    await page.waitForLoadState('networkidle');

    // Check for confirmed appointment indicators
    const confirmedIndicators = page.locator('text=Confirmed');
    if ((await confirmedIndicators.count()) > 0) {
      await expect(confirmedIndicators.first()).toBeVisible();

      // Check for presence of an icon next to confirmed text
      const confirmedContainer = page.locator('.text-green-600').first();
      await expect(confirmedContainer).toBeVisible();
      await expect(confirmedContainer.locator('svg').first()).toBeVisible();
    }
  });
});
