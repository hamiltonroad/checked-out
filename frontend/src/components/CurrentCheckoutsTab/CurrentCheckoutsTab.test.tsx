import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrentCheckoutsTab from './CurrentCheckoutsTab';
import type { CurrentCheckout } from '../../types';

describe('CurrentCheckoutsTab', () => {
  const mockOnReturn = vi.fn();

  const mockCheckouts: CurrentCheckout[] = [
    {
      id: 1,
      patronName: 'Jane Smith',
      bookTitle: 'The Great Gatsby',
      checkoutDate: '2026-03-20T14:00:00.000Z',
      dueDate: '2026-04-03T00:00:00.000Z',
      daysUntilDue: 0,
      returnDate: null,
    },
    {
      id: 2,
      patronName: 'John Doe',
      bookTitle: '1984',
      checkoutDate: '2026-03-15T10:00:00.000Z',
      dueDate: '2026-04-10T00:00:00.000Z',
      daysUntilDue: 7,
      returnDate: null,
    },
    {
      id: 3,
      patronName: 'Ada Lovelace',
      bookTitle: 'The Hobbit',
      checkoutDate: '2026-03-01T10:00:00.000Z',
      dueDate: '2026-03-30T00:00:00.000Z',
      daysUntilDue: -4,
      returnDate: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render checkout rows with correct data', () => {
    render(
      <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
  });

  it('should display "Due today" for items due today', () => {
    render(
      <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
    );

    expect(screen.getByText('Due today')).toBeInTheDocument();
  });

  it('should display overdue text for overdue items', () => {
    render(
      <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
    );

    expect(screen.getByText('4 days overdue')).toBeInTheDocument();
  });

  it('should display days remaining for non-urgent items', () => {
    render(
      <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
    );

    expect(screen.getByText('7 days')).toBeInTheDocument();
  });

  it('should render Return button for each checkout', () => {
    render(
      <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
    );

    const returnButtons = screen.getAllByRole('button', { name: /return/i });
    expect(returnButtons).toHaveLength(3);
  });

  it('should call onReturn when Return button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
    );

    const returnButtons = screen.getAllByRole('button', { name: /return/i });
    await user.click(returnButtons[0]);

    expect(mockOnReturn).toHaveBeenCalledWith(1);
  });

  it('should disable Return button after click to prevent duplicates', async () => {
    const user = userEvent.setup();
    render(
      <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
    );

    const returnButtons = screen.getAllByRole('button', { name: /return/i });
    await user.click(returnButtons[0]);

    expect(returnButtons[0]).toBeDisabled();
  });

  it('should render empty state when checkouts array is empty', () => {
    render(<CurrentCheckoutsTab checkouts={[]} onReturn={mockOnReturn} isLoading={false} />);

    expect(screen.getByText('No current checkouts')).toBeInTheDocument();
    expect(screen.getByText('No books are currently checked out.')).toBeInTheDocument();
  });

  it('should render loading skeleton when isLoading is true', () => {
    const { container } = render(
      <CurrentCheckoutsTab checkouts={[]} onReturn={mockOnReturn} isLoading={true} />
    );

    const skeleton = container.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(
      <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
    );

    expect(screen.getByText('Book Title')).toBeInTheDocument();
    expect(screen.getByText('Patron Name')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Days Until Due')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
