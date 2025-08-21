import { render, screen } from '@testing-library/react';
import Hero from '@/components/Hero';

describe('Hero', () => {
  it('renders the premium badge text', () => {
    render(<Hero />);
    expect(
      screen.getByText(/Premium Grooming Experience/i)
    ).toBeInTheDocument();
  });
});
