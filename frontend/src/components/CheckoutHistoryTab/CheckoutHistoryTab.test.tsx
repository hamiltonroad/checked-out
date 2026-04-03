import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckoutHistoryTab from './CheckoutHistoryTab';
import type { Checkout } from '../../types';

describe('CheckoutHistoryTab', () => {
  const mockCheckouts: Checkout[] = [
    {
      id: 1,
      patronName: 'Jane Smith',
      bookTitle: 'The Great Gatsby',
      checkoutDate: '2026-03-20T14:00:00.000Z',
      returnDate: '2026-03-28T09:00:00.000Z',
    },
    {
      id: 2,
      patronName: 'John Doe',
      bookTitle: '1984',
      checkoutDate: '2026-03-15T10:00:00.000Z',
      returnDate: '2026-03-25T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render checkout history rows with correct data', () => {
    render(<CheckoutHistoryTab checkouts={mockCheckouts} isLoading={false} />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
  });

  it('should not render Return buttons', () => {
    render(<CheckoutHistoryTab checkouts={mockCheckouts} isLoading={false} />);

    const returnButtons = screen.queryAllByRole('button', { name: /return/i });
    expect(returnButtons).toHaveLength(0);
  });

  it('should render empty state when checkouts array is empty', () => {
    render(<CheckoutHistoryTab checkouts={[]} isLoading={false} />);

    expect(screen.getByText('No checkout history')).toBeInTheDocument();
    expect(screen.getByText('No checkout history yet.')).toBeInTheDocument();
  });

  it('should render loading skeleton when isLoading is true', () => {
    const { container } = render(<CheckoutHistoryTab checkouts={[]} isLoading={true} />);

    const skeleton = container.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<CheckoutHistoryTab checkouts={mockCheckouts} isLoading={false} />);

    expect(screen.getByText('Book Title')).toBeInTheDocument();
    expect(screen.getByText('Patron Name')).toBeInTheDocument();
    expect(screen.getByText('Checkout Date')).toBeInTheDocument();
    expect(screen.getByText('Return Date')).toBeInTheDocument();
  });

  it('should display formatted dates', () => {
    render(<CheckoutHistoryTab checkouts={mockCheckouts} isLoading={false} />);

    expect(screen.getByText('Mar 20, 2026')).toBeInTheDocument();
    expect(screen.getByText('Mar 28, 2026')).toBeInTheDocument();
  });
});
