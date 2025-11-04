import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookDetailModal from './BookDetailModal';
import * as useBookHook from '../hooks/useBook';
import { vi } from 'vitest';

vi.mock('../hooks/useBook');

const renderWithQueryClient = (component) => {
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

  it('should display loading state', () => {
    useBookHook.useBook.mockReturnValue({ isLoading: true, data: null, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Book Details')).toBeInTheDocument();
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
        status: 'Available',
        authors: [
          { first_name: 'John', last_name: 'Doe' },
          { first_name: 'Jane', last_name: 'Smith' },
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
    expect(screen.getByText('Available')).toBeInTheDocument();
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

  it('should use fallback status when book.status is missing', () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        authors: [],
      },
    };
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: mockBook, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={1} />);

    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should call onClose when Close button is clicked', async () => {
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

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not fetch when bookId is null', () => {
    useBookHook.useBook.mockReturnValue({ isLoading: false, data: null, error: null });

    renderWithQueryClient(<BookDetailModal open={true} onClose={mockOnClose} bookId={null} />);

    expect(useBookHook.useBook).toHaveBeenCalledWith(null);
  });
});
