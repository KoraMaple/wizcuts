# E2E Tests

This directory contains Playwright end-to-end tests for the WizCuts application.

## Quick Start

```bash
# Install browsers (run once)
npm run e2e:install

# Run all tests
npm run e2e

# Run tests with UI mode
npm run e2e:ui

# Run specific test file
npx playwright test home.spec.ts

# Run tests in headed mode (visible browser)
npm run e2e:headed

# Debug tests
npm run e2e:debug
```

## Test Files

- `home.spec.ts` - Homepage functionality tests
- `navigation.spec.ts` - Navigation and routing tests  
- `booking.spec.ts` - Booking system tests
- `performance.spec.ts` - Performance and accessibility tests

## Utilities

- `utils/test-helpers.ts` - Common test utilities and helper functions
- `fixtures/test-data.ts` - Test data and mock responses

## Reports

After running tests, view the HTML report:

```bash
npm run e2e:report
```

For detailed documentation, see [E2E_TESTING.md](../E2E_TESTING.md).