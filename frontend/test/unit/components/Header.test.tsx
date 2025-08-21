import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

describe('Header', () => {
  it('renders WizCuts brand text', () => {
    render(<Header />);
    expect(screen.getByText('WizCuts')).toBeInTheDocument();
  });
});
