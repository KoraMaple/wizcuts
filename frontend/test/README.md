# Frontend Test Configuration

This directory contains all test-related configuration files and organized test suites for the
WizCuts frontend.

## Directory Structure

```text
test/
├── unit/                   # Unit tests
│   └── components/         # Component unit tests
│       ├── Header.test.tsx
│       ├── Footer.test.tsx
│       ├── Hero.test.tsx
│       └── Services.test.tsx
├── e2e/                    # End-to-end tests (Playwright)
│   ├── pages/              # Page-specific e2e tests
│   │   ├── home.spec.ts
│   │   └── navigation.spec.ts
│   ├── features/           # Feature-specific e2e tests
│   │   └── booking.spec.ts
│   ├── performance/        # Performance tests
│   │   └── performance.spec.ts
│   ├── fixtures/           # Test fixtures and data
│   ├── utils/              # Test utilities and helpers
│   └── fixtures.ts         # Global fixtures
├── babel.config.js         # Babel config for Jest only
├── jest.setup.js           # Jest setup and mocks
└── jest-dom.d.ts           # TypeScript definitions
```

## Test Types

### Unit Tests

- **Location**: `test/unit/`
- **Purpose**: Test individual components and functions in isolation
- **Framework**: Jest + React Testing Library
- **Run**: `npm test` or `npm run test:unit`

### End-to-End Tests

- **Location**: `test/e2e/`
- **Purpose**: Test complete user workflows and integration
- **Framework**: Playwright
- **Run**: `npm run test:e2e`

## Configuration Files

- **`jest.setup.js`** - Jest setup file with mocks for Next.js, framer-motion, and browser APIs
- **`babel.config.js`** - Babel configuration specifically for Jest to handle TypeScript and JSX
- **`jest-dom.d.ts`** - TypeScript definitions for jest-dom matchers

## Test Organization

Jest is configured via `jest.config.js` in the frontend root directory. This separation ensures
that:

1. Next.js uses its built-in Babel configuration for the application
2. Jest uses its own Babel configuration for tests
3. Test-related files are organized in a dedicated directory
4. Component tests are properly organized under `test/unit/components/`
5. Playwright e2e tests are organized by test type under `test/e2e/`

## Coverage Thresholds

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
