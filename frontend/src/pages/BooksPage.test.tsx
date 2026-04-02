import type React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BooksPage from './BooksPage';
import { useBooks } from '../hooks/useBooks';
import { useBook } from '../hooks/useBook';

vi.mock('../hooks/useBooks');
vi.mock('../hooks/useBook');

/** Wrap component in QueryClientProvider for components that use useQueryClient */
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// Mock useMediaQuery and useTheme from Material-UI
const mockUseMediaQuery = vi.fn();
const mockUseTheme = vi.fn(() => ({
  breakpoints: {
    down: () => 'md',
  },
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => mockUseMediaQuery(),
    useTheme: () => mockUseTheme(),
  };
});

/** Helper to build mock data in the new paginated response shape */
function makeMockResponse(books: Array<Record<string, unknown>>, total?: number) {
  const count = total !== undefined ? total : books.length;
  return {
    status: 'success',
    data: {
      books,
      pagination: { page: 1, limit: 20, total: count, totalPages: Math.ceil(count / 20) || 0 },
    },
  };
}

describe('BooksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(false);
    useBook.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  it('should show skeleton loading state when isLoading is true', () => {
    useBooks.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = renderWithQueryClient(<BooksPage />);

    expect(screen.getByText('Books')).toBeInTheDocument();
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display books table when data is loaded', () => {
    const mockData = makeMockResponse([
      {
        id: 1,
        title: 'The Great Gatsby',
        authors: [{ first_name: 'F. Scott', last_name: 'Fitzgerald' }],
        status: 'available',
      },
      {
        id: 2,
        title: '1984',
        authors: [{ first_name: 'George', last_name: 'Orwell' }],
        status: 'available',
      },
    ]);

    useBooks.mockReturnValue({ data: mockData, isLoading: false, error: null });

    renderWithQueryClient(<BooksPage />);

    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText('George Orwell')).toBeInTheDocument();
  });

  it('should show error alert when error occurs', () => {
    const mockError = new Error('Network error');
    useBooks.mockReturnValue({ data: undefined, isLoading: false, error: mockError });

    renderWithQueryClient(<BooksPage />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Error loading books/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  it('should display authors comma-separated', () => {
    const mockData = makeMockResponse([
      {
        id: 1,
        title: 'Good Omens',
        authors: [
          { first_name: 'Terry', last_name: 'Pratchett' },
          { first_name: 'Neil', last_name: 'Gaiman' },
        ],
        status: 'available',
      },
    ]);

    useBooks.mockReturnValue({ data: mockData, isLoading: false, error: null });

    renderWithQueryClient(<BooksPage />);

    expect(screen.getByText('Terry Pratchett, Neil Gaiman')).toBeInTheDocument();
  });

  it('should show availability status using StatusChip', () => {
    const mockData = makeMockResponse([
      {
        id: 1,
        title: 'Book 1',
        authors: [{ first_name: 'Author', last_name: 'One' }],
        status: 'available',
      },
      {
        id: 2,
        title: 'Book 2',
        authors: [{ first_name: 'Author', last_name: 'Two' }],
        status: 'checked_out',
      },
    ]);

    useBooks.mockReturnValue({ data: mockData, isLoading: false, error: null });

    const { container } = renderWithQueryClient(<BooksPage />);

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Checked Out')).toBeInTheDocument();

    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBeGreaterThanOrEqual(2);
  });

  describe('Search Functionality', () => {
    const mockBooksData = makeMockResponse([
      {
        id: 1,
        title: 'Clean Code',
        authors: [{ first_name: 'Robert', last_name: 'Martin' }],
        status: 'available',
      },
      {
        id: 2,
        title: 'The Pragmatic Programmer',
        authors: [
          { first_name: 'Andrew', last_name: 'Hunt' },
          { first_name: 'David', last_name: 'Thomas' },
        ],
        status: 'available',
      },
      {
        id: 3,
        title: 'Design Patterns',
        authors: [{ first_name: 'Erich', last_name: 'Gamma' }],
        status: 'available',
      },
    ]);

    beforeEach(() => {
      useBooks.mockReturnValue({
        data: mockBooksData,
        isLoading: false,
        error: null,
      });
    });

    it('should render search input with correct label and placeholder', () => {
      renderWithQueryClient(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'Search by title or author... (⌘K or Ctrl+K)'
      );
    });

    it('should show search chip after typing and debounce', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'clean');

      await waitFor(
        () => {
          expect(screen.getByText('Search: "clean"')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should show clear button when search has text', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');

      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

      await user.type(searchInput, 'clean');

      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'clean');

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('should show all books when search is empty', () => {
      renderWithQueryClient(<BooksPage />);

      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      expect(screen.getByText('Design Patterns')).toBeInTheDocument();
    });

    it('should show empty state when no books in library', () => {
      useBooks.mockReturnValue({
        data: makeMockResponse([]),
        isLoading: false,
        error: null,
      });

      renderWithQueryClient(<BooksPage />);

      expect(screen.getByText('No books in the library yet')).toBeInTheDocument();
    });
  });

  describe('Availability Filter', () => {
    const mockBooksData = makeMockResponse([
      {
        id: 1,
        title: 'Available Book 1',
        authors: [{ first_name: 'Author', last_name: 'One' }],
        status: 'available',
      },
      {
        id: 2,
        title: 'Checked Out Book',
        authors: [{ first_name: 'Author', last_name: 'Two' }],
        status: 'checked_out',
      },
      {
        id: 3,
        title: 'Available Book 2',
        authors: [{ first_name: 'Author', last_name: 'Three' }],
        status: 'available',
      },
    ]);

    beforeEach(() => {
      useBooks.mockReturnValue({
        data: mockBooksData,
        isLoading: false,
        error: null,
      });
    });

    it('should render availability filter dropdown', () => {
      renderWithQueryClient(<BooksPage />);

      const filterLabel = screen.getByLabelText('Availability');
      expect(filterLabel).toBeInTheDocument();
    });

    it('should show all books by default', () => {
      renderWithQueryClient(<BooksPage />);

      expect(screen.getByText('Available Book 1')).toBeInTheDocument();
      expect(screen.getByText('Checked Out Book')).toBeInTheDocument();
      expect(screen.getByText('Available Book 2')).toBeInTheDocument();
    });

    it('should filter to available books only (client-side)', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const filterSelect = screen.getByLabelText('Availability');
      await user.click(filterSelect);

      const availableOption = screen.getByRole('option', { name: 'Available' });
      await user.click(availableOption);

      await waitFor(() => {
        expect(screen.getByText('Available Book 1')).toBeInTheDocument();
        expect(screen.getByText('Available Book 2')).toBeInTheDocument();
        expect(screen.queryByText('Checked Out Book')).not.toBeInTheDocument();
      });
    });

    it('should filter to checked out books only (client-side)', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const filterSelect = screen.getByLabelText('Availability');
      await user.click(filterSelect);

      const checkedOutOption = screen.getByRole('option', { name: 'Checked Out' });
      await user.click(checkedOutOption);

      await waitFor(() => {
        expect(screen.getByText('Checked Out Book')).toBeInTheDocument();
        expect(screen.queryByText('Available Book 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Available Book 2')).not.toBeInTheDocument();
      });
    });

    it('should switch back to all books', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const filterSelect = screen.getByLabelText('Availability');
      await user.click(filterSelect);
      const availableOption = screen.getByRole('option', { name: 'Available' });
      await user.click(availableOption);

      await waitFor(() => {
        expect(screen.queryByText('Checked Out Book')).not.toBeInTheDocument();
      });

      await user.click(filterSelect);
      const allOption = screen.getByRole('option', { name: 'All Books' });
      await user.click(allOption);

      await waitFor(() => {
        expect(screen.getByText('Available Book 1')).toBeInTheDocument();
        expect(screen.getByText('Checked Out Book')).toBeInTheDocument();
        expect(screen.getByText('Available Book 2')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Chips', () => {
    const mockBooksData = makeMockResponse([
      {
        id: 1,
        title: 'Available Book 1',
        authors: [{ first_name: 'Author', last_name: 'One' }],
        status: 'available',
      },
      {
        id: 2,
        title: 'Checked Out Book',
        authors: [{ first_name: 'Author', last_name: 'Two' }],
        status: 'checked_out',
      },
    ]);

    beforeEach(() => {
      useBooks.mockReturnValue({
        data: mockBooksData,
        isLoading: false,
        error: null,
      });
    });

    it('should not show chips when no filters are active', () => {
      renderWithQueryClient(<BooksPage />);

      expect(screen.queryByText(/Search:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Availability:/)).not.toBeInTheDocument();
    });

    it('should show search chip when search term is active', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'test');

      await waitFor(
        () => {
          expect(screen.getByText('Search: "test"')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should show availability chip when filter is not All', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const filterSelect = screen.getByLabelText('Availability');
      await user.click(filterSelect);
      const availableOption = screen.getByRole('option', { name: 'Available' });
      await user.click(availableOption);

      await waitFor(() => {
        expect(screen.getByText('Availability: Available')).toBeInTheDocument();
      });
    });

    it('should clear all filters when Clear all button is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'test');

      const filterSelect = screen.getByLabelText('Availability');
      await user.click(filterSelect);
      const availableOption = screen.getByRole('option', { name: 'Available' });
      await user.click(availableOption);

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'Clear all filters' })).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const clearAllButton = screen.getByRole('button', { name: 'Clear all filters' });
      await user.click(clearAllButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.queryByText('Search: "test"')).not.toBeInTheDocument();
        expect(screen.queryByText('Availability: Available')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Rendering', () => {
    const mockBooksData = makeMockResponse([
      {
        id: 1,
        title: 'The Great Gatsby',
        authors: [{ first_name: 'F. Scott', last_name: 'Fitzgerald' }],
        status: 'available',
      },
      {
        id: 2,
        title: '1984',
        authors: [{ first_name: 'George', last_name: 'Orwell' }],
        status: 'checked_out',
      },
    ]);

    it('should display table view on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false);
      useBooks.mockReturnValue({ data: mockBooksData, isLoading: false, error: null });

      const { container } = renderWithQueryClient(<BooksPage />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();

      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards.length).toBe(0);
    });

    it('should display card view on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true);
      useBooks.mockReturnValue({ data: mockBooksData, isLoading: false, error: null });

      const { container } = renderWithQueryClient(<BooksPage />);

      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards.length).toBe(2);

      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should open modal when clicking book card on mobile', async () => {
      const user = userEvent.setup();
      mockUseMediaQuery.mockReturnValue(true);
      useBooks.mockReturnValue({ data: mockBooksData, isLoading: false, error: null });

      const { container } = renderWithQueryClient(<BooksPage />);

      const firstCard = container.querySelector('.MuiCard-root');
      await user.click(firstCard);

      await waitFor(() => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });
  });
});
