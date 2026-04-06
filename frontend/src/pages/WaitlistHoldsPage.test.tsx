import type React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WaitlistHoldsPage from './WaitlistHoldsPage';
import { useMyWaitlist, useLeaveWaitlist } from '../hooks/useWaitlist';
import { useMyHolds, useCheckoutHold } from '../hooks/useHolds';
import type { WaitlistEntryData, HoldData } from '../types';

vi.mock('../hooks/useWaitlist');
vi.mock('../hooks/useHolds');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeEntry(overrides: Partial<WaitlistEntryData> = {}): WaitlistEntryData {
  return {
    id: 1,
    patron_id: 10,
    book_id: 100,
    format: 'physical',
    position: 2,
    status: 'waiting',
    created_at: '2026-03-15T12:00:00.000Z',
    queue_size: 5,
    total_copies: 3,
    book: { id: 100, title: 'Test Book' },
    ...overrides,
  };
}

function makeHold(overrides: Partial<HoldData> = {}): HoldData {
  const future = new Date();
  future.setDate(future.getDate() + 2);
  return {
    id: 1,
    copy_id: 50,
    patron_id: 10,
    waitlist_entry_id: null,
    expires_at: future.toISOString(),
    status: 'active',
    created_at: '2026-04-01T12:00:00.000Z',
    copy: { id: 50, book_id: 100, format: 'physical', book: { id: 100, title: 'Held Book' } },
    ...overrides,
  };
}

function renderPage(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const mockLeaveMutate = vi.fn();
const mockCheckoutMutate = vi.fn();

describe('WaitlistHoldsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLeaveWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockLeaveMutate });
    (useCheckoutHold as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockCheckoutMutate });
  });

  it('renders page heading and section headers', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });

    renderPage(<WaitlistHoldsPage />);

    expect(screen.getByRole('heading', { name: 'Waitlist & Holds' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ready for Checkout' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Queue' })).toBeInTheDocument();
  });

  it('shows skeleton cards during loading', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = renderPage(<WaitlistHoldsPage />);

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty states when no entries or holds exist', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });

    renderPage(<WaitlistHoldsPage />);

    expect(screen.getByText('No books ready for checkout')).toBeInTheDocument();
    expect(screen.getByText('Not on any waitlists')).toBeInTheDocument();
  });

  it('renders waitlist entries in the In Queue section', () => {
    const entries = [
      makeEntry({ id: 1, book_id: 100, book: { id: 100, title: 'Book A' } }),
      makeEntry({ id: 2, book_id: 200, book: { id: 200, title: 'Book B' }, format: 'kindle' }),
    ];
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: entries,
      isLoading: false,
    });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });

    renderPage(<WaitlistHoldsPage />);

    expect(screen.getByText('Book A')).toBeInTheDocument();
    expect(screen.getByText('Book B')).toBeInTheDocument();
  });

  it('renders holds in the Ready for Checkout section', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeHold()],
      isLoading: false,
    });

    renderPage(<WaitlistHoldsPage />);

    expect(screen.getByText('Held Book')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check Out' })).toBeInTheDocument();
  });

  it('calls leaveWaitlist.mutate when Leave Waitlist is clicked', async () => {
    const user = userEvent.setup();
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeEntry()],
      isLoading: false,
    });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });

    renderPage(<WaitlistHoldsPage />);

    await user.click(screen.getByRole('button', { name: 'Leave Waitlist' }));
    expect(mockLeaveMutate).toHaveBeenCalledWith(
      { bookId: 100, format: 'physical' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it('calls checkoutHold.mutate when Check Out is clicked', async () => {
    const user = userEvent.setup();
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeHold()],
      isLoading: false,
    });

    renderPage(<WaitlistHoldsPage />);

    await user.click(screen.getByRole('button', { name: 'Check Out' }));
    expect(mockCheckoutMutate).toHaveBeenCalledWith(
      50,
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it('navigates to catalog when Browse Catalog is clicked in empty state', async () => {
    const user = userEvent.setup();
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });

    renderPage(<WaitlistHoldsPage />);

    await user.click(screen.getByRole('button', { name: 'Browse Catalog' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('does not show skeletons when not loading', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeEntry()],
      isLoading: false,
    });
    (useMyHolds as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });

    const { container } = renderPage(<WaitlistHoldsPage />);

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(0);
  });
});
