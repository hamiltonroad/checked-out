import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CurrentCheckoutsTab from './CurrentCheckoutsTab';
import type { CurrentCheckout } from '../../types';

describe('CurrentCheckoutsTab', () => {
  const mockOnReturn = vi.fn();

  const mockCheckouts: CurrentCheckout[] = [
    {
      id: 1,
      patronId: 10,
      patronName: 'Jane Smith',
      bookTitle: 'The Great Gatsby',
      checkoutDate: '2026-03-20T14:00:00.000Z',
      dueDate: '2026-04-03T00:00:00.000Z',
      daysUntilDue: 0,
      returnDate: null,
    },
    {
      id: 2,
      patronId: 20,
      patronName: 'John Doe',
      bookTitle: '1984',
      checkoutDate: '2026-03-15T10:00:00.000Z',
      dueDate: '2026-04-10T00:00:00.000Z',
      daysUntilDue: 7,
      returnDate: null,
    },
    {
      id: 3,
      patronId: 30,
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
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
  });

  it('should display "Due today" for items due today', () => {
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Due today')).toBeInTheDocument();
  });

  it('should display overdue text for overdue items', () => {
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('4 days overdue')).toBeInTheDocument();
  });

  it('should display days remaining for non-urgent items', () => {
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('7 days')).toBeInTheDocument();
  });

  it('should render Return button for each checkout', () => {
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    const returnButtons = screen.getAllByRole('button', { name: /return/i });
    expect(returnButtons).toHaveLength(3);
  });

  it('should call onReturn after confirming the dialog', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    const returnButtons = screen.getAllByRole('button', { name: /return/i });
    await user.click(returnButtons[0]);

    expect(mockOnReturn).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'Return this book?', level: 2 })
    ).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Return' }));

    expect(mockOnReturn).toHaveBeenCalledWith(1);
  });

  it('should disable Return button while the mutation is in flight', async () => {
    const user = userEvent.setup();
    // Pending promise — never resolves during the test, so the in-flight state persists.
    const pendingReturn = vi.fn(() => new Promise<void>(() => {}));
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={pendingReturn} isLoading={false} />
      </MemoryRouter>
    );

    const returnButtons = screen.getAllByRole('button', { name: /return/i });
    await user.click(returnButtons[0]);
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Return' }));

    const rowButtonsAfter = screen.getAllByRole('button', { name: /return/i });
    expect(rowButtonsAfter[0]).toBeDisabled();
  });

  it('should not call onReturn when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    const returnButtons = screen.getAllByRole('button', { name: /return/i });
    await user.click(returnButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnReturn).not.toHaveBeenCalled();
  });

  it('should render empty state when checkouts array is empty', () => {
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={[]} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('No current checkouts')).toBeInTheDocument();
    expect(screen.getByText('No books are currently checked out.')).toBeInTheDocument();
  });

  it('should render loading skeleton when isLoading is true', () => {
    const { container } = render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={[]} onReturn={mockOnReturn} isLoading={true} />
      </MemoryRouter>
    );

    const skeleton = container.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(
      <MemoryRouter>
        <CurrentCheckoutsTab checkouts={mockCheckouts} onReturn={mockOnReturn} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Book Title')).toBeInTheDocument();
    expect(screen.getByText('Patron Name')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Days Until Due')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
