import { render, screen } from '@testing-library/react';
import Services from '@/components/Services';

describe('Services', () => {
  it('renders the section heading', () => {
    render(<Services />);
    expect(screen.getByText(/Our Services/i)).toBeInTheDocument();
  });
});
