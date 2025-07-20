/**
 * Jest Test Setup File
 * This file is executed after the test environment is set up
 */

// Global test configuration
import 'reflect-metadata';

// Mock console methods in test environment to reduce noise
if (process.env.NODE_ENV === 'test') {
  // Suppress console.log in tests unless explicitly needed
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Set test timeout
jest.setTimeout(30000);

// Mock Date.now() for consistent test results
const mockDate = new Date('2024-01-01T00:00:00Z');
jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime());

// Global afterEach to clean up mocks
afterEach(() => {
  jest.clearAllMocks();
});

// Global test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.CLERK_SECRET_KEY = 'test-clerk-secret';
process.env.CLERK_PUBLISHABLE_KEY = 'test-clerk-publishable';
