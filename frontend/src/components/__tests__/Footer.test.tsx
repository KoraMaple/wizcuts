import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders footer section', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('displays brand name', () => {
    render(<Footer />);
    expect(screen.getByText('WizCuts')).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<Footer />);
    expect(screen.getByText(/Premium Grooming Experience/)).toBeInTheDocument();
  });

  it('displays quick links', () => {
    render(<Footer />);
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('displays business hours', () => {
    render(<Footer />);
    expect(screen.getByText('Business Hours')).toBeInTheDocument();
  });
});