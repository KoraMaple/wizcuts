import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('renders WizCuts brand heading', () => {
    render(<Footer />);
    // Target the brand heading specifically to avoid multiple matches
    expect(
      screen.getByRole('heading', { name: /WizCuts/i })
    ).toBeInTheDocument();
  });
});
