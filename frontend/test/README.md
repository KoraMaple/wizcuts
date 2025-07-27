# Frontend Test Configuration

This directory contains all test-related configuration files for the WizCuts frontend.

## Files

- **`jest.setup.js`** - Jest setup file with mocks for Next.js, framer-motion, and browser APIs
- **`babel.config.js`** - Babel configuration specifically for Jest to handle TypeScript and JSX
- **`jest-dom.d.ts`** - TypeScript definitions for jest-dom matchers

## Structure

```text
test/
├── babel.config.js     # Babel config for Jest only
├── jest.setup.js       # Jest setup and mocks
└── jest-dom.d.ts       # TypeScript definitions
```

## Configuration

Jest is configured via `jest.config.js` in the frontend root directory. This separation ensures
that:

1. Next.js uses its built-in Babel configuration for the application
2. Jest uses its own Babel configuration for tests
3. Test-related files are organized in a dedicated directory

## Coverage Thresholds

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
