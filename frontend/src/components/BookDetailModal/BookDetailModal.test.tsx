import type React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookDetailModal from './BookDetailModal';
import * as useBookHook from '../../hooks/useBook';
import { vi } from 'vitest';

vi.mock('../../hooks/useBook');

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('BookDetailModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: null, error: null });

    renderWithQueryClient(<BookDetailModal open={false} onClose={mockOnClose} bookId={1} />);

    expect(screen.queryByText('Book Details')).not.toBeInTheDocument();
  });

  it('should display skeleton loading state', async () => {
    useBookHook.useBook.mockReturnValue({ isLoading: true, data: null, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    expect(screen.getByText('Book Details')).toBeInTheDocument();

    // Verify skeleton elements are present - Dialog renders in body, not in container
    await waitFor(() => {
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('should display error state', () => {
    const error = new Error('Failed to load book');
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: null, error });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    expect(screen.getByText(/Error loading book/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load book/i)).toBeInTheDocument();
  });

  it('should display book details when loaded', () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        isbn: '1234567890',
        publisher: 'Test Publisher',
        publication_year: 2023,
        genre: 'Fiction',
        status: 'available',
        authors: [
          { first_name: 'John', last_name: 'Doe' },
          { first_name: 'Jane', last_name: 'Smith' },
        ],
        copies: [
          { id: 1, book_id: 1, format: 'physical', checkouts: [] },
          { id: 2, book_id: 1, format: 'kindle', checkouts: [] },
        ],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('John Doe, Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('Test Publisher')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('2 copies')).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Minimal Book',
        authors: [{ first_name: 'John', last_name: 'Doe' }],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    expect(screen.getByText('Minimal Book')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('ISBN')).not.toBeInTheDocument();
    expect(screen.queryByText('Publisher')).not.toBeInTheDocument();
  });

  it('should show "No copies" when copies array is empty', () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        authors: [],
        copies: [],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    expect(screen.getByText('No copies')).toBeInTheDocument();
  });

  it('should disable checkout button when copies is empty', () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        authors: [],
        copies: [],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    const checkoutButton = screen.getByRole('button', { name: /check out/i });
    expect(checkoutButton).toBeDisabled();
  });

  it('should call onClose when Close button (in actions) is clicked', async () => {
    const user = userEvent.setup();
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        authors: [],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    // Get all close buttons and click the second one (text button in actions)
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButtons[1]);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not fetch when bookId is null', () => {
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: null, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={null} />);

    expect(useBookHook.useBook).toHaveBeenCalledWith(null);
  });

  it('should call onClose when close icon button is clicked', async () => {
    const user = userEvent.setup();
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        authors: [],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    // Get all close buttons and click the first one (icon button in header)
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should render dividers between sections', () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        authors: [{ first_name: 'John', last_name: 'Doe' }],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    const dividers = document.querySelectorAll('.MuiDivider-root');
    expect(dividers.length).toBeGreaterThanOrEqual(2);
  });

  it('should render book cover placeholder with icon', () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        authors: [{ first_name: 'John', last_name: 'Doe' }],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    // MenuBookIcon should be rendered
    const bookIcon = document.querySelector('[data-testid="MenuBookIcon"]');
    expect(bookIcon).toBeInTheDocument();
  });

  it('should render responsive layout with correct structure', () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        authors: [{ first_name: 'John', last_name: 'Doe' }],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    // Stack container should be present for responsive layout
    const stackContainer = document.querySelector('.MuiStack-root');
    expect(stackContainer).toBeInTheDocument();

    // Book title should be rendered in the layout
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });
});
