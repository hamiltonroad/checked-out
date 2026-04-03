import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutTable from './CheckoutTable';

describe('CheckoutTable', () => {
  const mockOnReturn = vi.fn();

  const mockCheckouts = [
    {
      id: 1,
      patronId: 10,
      patronName: 'Jane Smith',
      bookTitle: 'The Great Gatsby',
      checkoutDate: '2026-03-20T14:00:00.000Z',
      returnDate: null,
    },
    {
      id: 2,
      patronId: 20,
      patronName: 'John Doe',
      bookTitle: '1984',
      checkoutDate: '2026-03-15T10:00:00.000Z',
      returnDate: '2026-03-28T09:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render checkout rows with correct data', () => {
    render(<CheckoutTable checkouts={mockCheckouts} onReturn={mockOnReturn} />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
  });

  it('should render Return button only for active checkouts', () => {
    render(<CheckoutTable checkouts={mockCheckouts} onReturn={mockOnReturn} />);

    const returnButtons = screen.getAllByRole('button', { name: /return/i });
    expect(returnButtons).toHaveLength(1);
  });

  it('should call onReturn with correct id when Return button is clicked', async () => {
    const user = userEvent.setup();
    render(<CheckoutTable checkouts={mockCheckouts} onReturn={mockOnReturn} />);

    const returnButton = screen.getByRole('button', { name: /return/i });
    await user.click(returnButton);

    expect(mockOnReturn).toHaveBeenCalledWith(1);
    expect(mockOnReturn).toHaveBeenCalledTimes(1);
  });

  it('should render empty state when checkouts array is empty', () => {
    render(<CheckoutTable checkouts={[]} onReturn={mockOnReturn} />);

    expect(screen.getByText('No checkouts found')).toBeInTheDocument();
    expect(screen.getByText('There are no checkout records to display.')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<CheckoutTable checkouts={mockCheckouts} onReturn={mockOnReturn} />);

    expect(screen.getByText('Patron Name')).toBeInTheDocument();
    expect(screen.getByText('Book Title')).toBeInTheDocument();
    expect(screen.getByText('Checkout Date')).toBeInTheDocument();
    expect(screen.getByText('Return Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should display formatted dates', () => {
    render(<CheckoutTable checkouts={mockCheckouts} onReturn={mockOnReturn} />);

    expect(screen.getByText('Mar 20, 2026')).toBeInTheDocument();
    expect(screen.getByText('Mar 28, 2026')).toBeInTheDocument();
  });
});
