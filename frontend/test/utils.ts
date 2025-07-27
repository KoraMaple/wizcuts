// Test utilities and helpers for WizCuts frontend tests

// Re-export common testing utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Common test setup utilities
export const mockClerkUser = (isSignedIn = false, user = null) => {
  const mockUseUser = jest.fn();

  mockUseUser.mockReturnValue({
    isSignedIn,
    isLoaded: true,
    user,
  });

  return mockUseUser;
};

// Common test data
export const testUsers = {
  signedOut: {
    isSignedIn: false,
    isLoaded: true,
    user: null,
  },
  signedIn: {
    isSignedIn: true,
    isLoaded: true,
    user: {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  },
};

// Common mock functions
export const createMockClerk = () => ({
  useUser: () => testUsers.signedOut,
  useAuth: () => ({
    isSignedIn: false,
    isLoaded: true,
    signOut: jest.fn(),
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: ({ children }: { children?: React.ReactNode }) =>
    children || 'Sign In',
  SignUpButton: ({ children }: { children?: React.ReactNode }) =>
    children || 'Sign Up',
  UserButton: () => 'User',
  RedirectToSignIn: () => null,
});
