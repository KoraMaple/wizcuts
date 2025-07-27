import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header Component', () => {
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

  it('displays book now button', () => {
    render(<Header />);
    expect(screen.getByText('Book Now')).toBeInTheDocument();
  });
});
