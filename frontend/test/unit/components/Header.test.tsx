import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

// Mock Clerk for signed-in state
const mockUseUser = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
  useAuth: () => ({
    isSignedIn: mockUseUser().isSignedIn,
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
}));

describe('Header Component', () => {
  beforeEach(() => {
    // Default to signed-out state
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
      user: null,
    });
  });

  it('renders header navigation', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('displays logo with scissors icon', () => {
    render(<Header />);
    expect(screen.getByText('WizCuts')).toBeInTheDocument();
  });

  it('displays navigation items', () => {
    render(<Header />);
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('displays sign in button when not authenticated', () => {
    render(<Header />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('displays book now button when authenticated', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      user: { id: '1', firstName: 'Test' },
    });

    render(<Header />);
    expect(screen.getByText('Book Now')).toBeInTheDocument();
  });
});
