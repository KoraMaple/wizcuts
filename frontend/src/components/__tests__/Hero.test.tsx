import { render, screen } from '@testing-library/react';
import Hero from '../Hero';

describe('Hero Component', () => {
  it('renders hero section', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', { name: /Redefine Your Style/i });
    expect(heading).toBeInTheDocument();
  });

  it('displays main heading', () => {
    render(<Hero />);
    expect(screen.getByText(/Redefine Your/)).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
  });

  it('displays subtitle text', () => {
    render(<Hero />);
    expect(screen.getByText(/Experience the art of sophisticated grooming/)).toBeInTheDocument();
  });

  it('displays CTA buttons', () => {
    render(<Hero />);
    expect(screen.getByText('Book Your Experience')).toBeInTheDocument();
    expect(screen.getByText('View Our Work')).toBeInTheDocument();
  });

  it('displays stats section', () => {
    render(<Hero />);
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('15+')).toBeInTheDocument();
    expect(screen.getByText('2K+')).toBeInTheDocument();
    expect(screen.getByText('24/7')).toBeInTheDocument();
  });
});