import type React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyWaitlistPage from './MyWaitlistPage';
import { useMyWaitlist, useLeaveWaitlist } from '../hooks/useWaitlist';
import type { WaitlistEntryData } from '../types';

vi.mock('../hooks/useWaitlist');

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

function renderPage(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const mockMutate = vi.fn();

describe('MyWaitlistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLeaveWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockMutate });
  });

  it('renders page heading and subheading', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderPage(<MyWaitlistPage />);

    expect(screen.getByRole('heading', { name: 'My Waitlist' })).toBeInTheDocument();
    expect(screen.getByText('Books you are waiting for')).toBeInTheDocument();
  });

  it('shows skeleton cards during loading', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = renderPage(<MyWaitlistPage />);

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no entries exist', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderPage(<MyWaitlistPage />);

    expect(screen.getByText("You're not on any waitlists")).toBeInTheDocument();
    expect(
      screen.getByText('Browse the catalog to join a waitlist when a book is unavailable.')
    ).toBeInTheDocument();
  });

  it('navigates to catalog when Browse Catalog is clicked in empty state', async () => {
    const user = userEvent.setup();
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderPage(<MyWaitlistPage />);

    await user.click(screen.getByRole('button', { name: 'Browse Catalog' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders waitlist entries when data is loaded', () => {
    const entries = [
      makeEntry({ id: 1, book_id: 100, book: { id: 100, title: 'Book A' } }),
      makeEntry({ id: 2, book_id: 200, book: { id: 200, title: 'Book B' }, format: 'kindle' }),
    ];
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: entries,
      isLoading: false,
    });

    renderPage(<MyWaitlistPage />);

    expect(screen.getByText('Book A')).toBeInTheDocument();
    expect(screen.getByText('Book B')).toBeInTheDocument();
  });

  it('calls leaveWaitlist.mutate when Leave Waitlist is clicked', async () => {
    const user = userEvent.setup();
    const entries = [makeEntry()];
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: entries,
      isLoading: false,
    });

    renderPage(<MyWaitlistPage />);

    await user.click(screen.getByRole('button', { name: 'Leave Waitlist' }));
    expect(mockMutate).toHaveBeenCalledWith(
      { bookId: 100, format: 'physical' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it('does not show skeletons when not loading', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeEntry()],
      isLoading: false,
    });

    const { container } = renderPage(<MyWaitlistPage />);

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(0);
  });

  it('does not show empty state when entries exist', () => {
    (useMyWaitlist as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeEntry()],
      isLoading: false,
    });

    renderPage(<MyWaitlistPage />);

    expect(screen.queryByText("You're not on any waitlists")).not.toBeInTheDocument();
  });
});
