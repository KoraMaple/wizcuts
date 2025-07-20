import { render, screen } from '@testing-library/react';
import Services from '../Services';

describe('Services Component', () => {
  it('renders services section', () => {
    render(<Services />);
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });

  it('displays section heading', () => {
    render(<Services />);
    expect(screen.getByText(/Our Services/)).toBeInTheDocument();
  });

  it('displays service descriptions', () => {
    render(<Services />);
    expect(screen.getByText(/premium grooming services/i)).toBeInTheDocument();
  });
});