# End-to-End Testing with Playwright

This project uses [Playwright](https://playwright.dev/) for comprehensive end-to-end (E2E) testing.
Playwright provides reliable testing across all major browsers and includes powerful features for
debugging and visual testing.

## Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Debugging Tests](#debugging-tests)
- [Test Reports](#test-reports)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- The application running on `http://localhost:3000`

### Installation

Playwright is already configured as a development dependency. To install the browsers needed for
testing:

```bash
cd frontend
npm run e2e:install
```

This will download Chromium, Firefox, and WebKit browsers needed for cross-browser testing.

## Running Tests

### Basic Test Execution

```bash
# Run all E2E tests
npm run e2e

# Run tests in headed mode (visible browser)
npm run e2e:headed

# Run tests with UI mode (interactive)
npm run e2e:ui
```

### Browser-Specific Testing

```bash
# Run tests on specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests on mobile devices
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Filtering Tests

```bash
# Run specific test file
npx playwright test home.spec.ts

# Run tests matching a pattern
npx playwright test --grep "navigation"

# Run tests in a specific directory
npx playwright test e2e/booking/
```

## Writing Tests

### Test Structure

Tests are organized in the `e2e/` directory with the following structure:

```
frontend/
├── e2e/
│   ├── home.spec.ts           # Homepage tests
│   ├── navigation.spec.ts     # Navigation flow tests
│   ├── booking.spec.ts        # Booking system tests
│   └── ...                    # Additional test files
├── playwright.config.ts       # Playwright configuration
└── package.json
```

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should perform specific action', async ({ page }) => {
    // Test steps
    await page.click('button[data-testid="submit"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Page Object Model

For complex applications, consider using the Page Object Model pattern:

```typescript
// e2e/pages/BookingPage.ts
export class BookingPage {
  constructor(private page: Page) {}

  async navigateToBooking() {
    await this.page.goto('/booking');
  }

  async fillBookingForm(name: string, email: string) {
    await this.page.fill('[name="customerName"]', name);
    await this.page.fill('[name="email"]', email);
  }

  async submitBooking() {
    await this.page.click('button[type="submit"]');
  }
}

// In your test file
test('should create booking', async ({ page }) => {
  const bookingPage = new BookingPage(page);
  await bookingPage.navigateToBooking();
  await bookingPage.fillBookingForm('John Doe', 'john@example.com');
  await bookingPage.submitBooking();

  await expect(page.locator('.booking-confirmation')).toBeVisible();
});
```

### Data-Driven Testing

```typescript
const testData = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', email: 'jane@example.com' },
];

testData.forEach(({ name, email }) => {
  test(`should handle booking for ${name}`, async ({ page }) => {
    await page.goto('/booking');
    await page.fill('[name="customerName"]', name);
    await page.fill('[name="email"]', email);
    await page.click('button[type="submit"]');

    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

## Debugging Tests

### Debug Mode

```bash
# Run specific test in debug mode
npm run e2e:debug

# Debug specific test file
npx playwright test --debug home.spec.ts
```

### Visual Debugging

```bash
# Run tests with UI mode for interactive debugging
npm run e2e:ui
```

### Screenshots and Videos

Tests are configured to automatically capture:

- Screenshots on failure
- Videos on failure
- Traces on first retry

Access these in the `test-results/` directory after test runs.

### Console Debugging

```typescript
test('debug example', async ({ page }) => {
  // Add console logs
  console.log('Navigating to page...');
  await page.goto('/');

  // Pause execution for debugging
  await page.pause();

  // Log page content
  const content = await page.textContent('body');
  console.log('Page content:', content);
});
```

## Test Reports

### Viewing Reports

```bash
# Open HTML report
npm run e2e:report

# Generate and view report after test run
npm run e2e && npm run e2e:report
```

### Report Formats

The configuration generates multiple report formats:

- **HTML Report**: Interactive report with screenshots and videos
- **JSON Report**: Machine-readable results in `test-results/results.json`
- **JUnit Report**: XML format for CI/CD integration in `test-results/results.xml`

## Best Practices

### 1. Use Data Test IDs

```typescript
// Good: Use data-testid attributes
await page.click('[data-testid="submit-booking"]');

// Avoid: Relying on class names or text that might change
await page.click('.btn-primary'); // Fragile
```

### 2. Wait for Elements Properly

```typescript
// Good: Use Playwright's auto-waiting
await expect(page.locator('.loading-spinner')).toBeHidden();
await expect(page.locator('.content')).toBeVisible();

// Avoid: Arbitrary timeouts
await page.waitForTimeout(5000); // Flaky
```

### 3. Keep Tests Independent

```typescript
// Good: Each test sets up its own state
test('should create booking', async ({ page }) => {
  await page.goto('/booking');
  // Test-specific setup
});

// Avoid: Tests depending on each other
test('should login first', async ({ page }) => {
  /* ... */
});
test('should create booking after login', async ({ page }) => {
  // Don't assume previous test ran
});
```

### 4. Use Meaningful Test Names

```typescript
// Good: Descriptive test names
test('should display error message when booking form submitted with empty required fields', async ({
  page,
}) => {
  // ...
});

// Avoid: Vague test names
test('test booking', async ({ page }) => {
  // ...
});
```

### 5. Group Related Tests

```typescript
test.describe('Booking Form Validation', () => {
  test('should require customer name', async ({ page }) => {
    /* ... */
  });
  test('should require valid email', async ({ page }) => {
    /* ... */
  });
  test('should require service selection', async ({ page }) => {
    /* ... */
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright browsers
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Build application
        run: |
          cd frontend
          npm run build

      - name: Start application
        run: |
          cd frontend
          npm start &

      - name: Run E2E tests
        run: |
          cd frontend
          npm run e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

### Running in Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

CMD ["npm", "run", "e2e"]
```

## Troubleshooting

### Common Issues

1. **Browser Installation Failures**

   ```bash
   # Try installing browsers with dependencies
   npx playwright install --with-deps
   ```

2. **Port Already in Use**

   ```bash
   # Change port in playwright.config.ts or stop existing processes
   lsof -ti:3000 | xargs kill -9
   ```

3. **Flaky Tests**
   - Increase timeout values in config
   - Use proper waiting strategies
   - Check for race conditions

4. **Screenshots Not Generated**
   - Ensure `screenshot: 'only-on-failure'` is set in config
   - Check file permissions in test-results directory

### Getting Help

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Community Discord](https://discord.gg/playwright-807756831384403968)

---

## Contributing

When adding new E2E tests:

1. Follow the existing test structure and naming conventions
2. Add appropriate test documentation
3. Ensure tests are stable and not flaky
4. Update this documentation if needed
5. Test on multiple browsers before submitting

For questions about E2E testing in this project, please create an issue or reach out to the
development team.
