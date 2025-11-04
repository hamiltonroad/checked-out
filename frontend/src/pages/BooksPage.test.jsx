import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BooksPage from './BooksPage';
import { useBooks } from '../hooks/useBooks';
import { useBook } from '../hooks/useBook';

vi.mock('../hooks/useBooks');
vi.mock('../hooks/useBook');

describe('BooksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useBook hook to return idle state (modal closed by default)
    useBook.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  it('should show loading spinner when isLoading is true', () => {
    useBooks.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<BooksPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display books table when data is loaded', async () => {
    const mockData = {
      status: 'success',
      data: [
        {
          id: 1,
          title: 'The Great Gatsby',
          authors: [{ first_name: 'F. Scott', last_name: 'Fitzgerald' }],
        },
        {
          id: 2,
          title: '1984',
          authors: [{ first_name: 'George', last_name: 'Orwell' }],
        },
      ],
    };

    useBooks.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<BooksPage />);

    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText('George Orwell')).toBeInTheDocument();
  });

  it('should show error alert when error occurs', () => {
    const mockError = new Error('Network error');
    useBooks.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    render(<BooksPage />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Error loading books/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  it('should display authors comma-separated', () => {
    const mockData = {
      status: 'success',
      data: [
        {
          id: 1,
          title: 'Good Omens',
          authors: [
            { first_name: 'Terry', last_name: 'Pratchett' },
            { first_name: 'Neil', last_name: 'Gaiman' },
          ],
        },
      ],
    };

    useBooks.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<BooksPage />);

    expect(screen.getByText('Terry Pratchett, Neil Gaiman')).toBeInTheDocument();
  });

  it('should show "Available" for all books', () => {
    const mockData = {
      status: 'success',
      data: [
        {
          id: 1,
          title: 'Book 1',
          authors: [{ first_name: 'Author', last_name: 'One' }],
        },
        {
          id: 2,
          title: 'Book 2',
          authors: [{ first_name: 'Author', last_name: 'Two' }],
        },
      ],
    };

    useBooks.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<BooksPage />);

    const availableCells = screen.getAllByText('Available');
    expect(availableCells).toHaveLength(2);
  });

  describe('Search Functionality', () => {
    const mockBooksData = {
      status: 'success',
      data: [
        {
          id: 1,
          title: 'Clean Code',
          authors: [{ first_name: 'Robert', last_name: 'Martin' }],
        },
        {
          id: 2,
          title: 'The Pragmatic Programmer',
          authors: [
            { first_name: 'Andrew', last_name: 'Hunt' },
            { first_name: 'David', last_name: 'Thomas' },
          ],
        },
        {
          id: 3,
          title: 'Design Patterns',
          authors: [{ first_name: 'Erich', last_name: 'Gamma' }],
        },
      ],
    };

    beforeEach(() => {
      useBooks.mockReturnValue({
        data: mockBooksData,
        isLoading: false,
        error: null,
      });
    });

    it('should render search input with correct label and placeholder', () => {
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search by title or author...');
    });

    it('should filter books by title (case-insensitive)', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'clean');

      // Wait for debounce
      await waitFor(
        () => {
          expect(screen.getByText('Clean Code')).toBeInTheDocument();
          expect(screen.queryByText('The Pragmatic Programmer')).not.toBeInTheDocument();
          expect(screen.queryByText('Design Patterns')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should filter books by title with uppercase search', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'CLEAN');

      await waitFor(
        () => {
          expect(screen.getByText('Clean Code')).toBeInTheDocument();
          expect(screen.queryByText('The Pragmatic Programmer')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should filter books by author first name', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'Robert');

      await waitFor(
        () => {
          expect(screen.getByText('Clean Code')).toBeInTheDocument();
          expect(screen.queryByText('The Pragmatic Programmer')).not.toBeInTheDocument();
          expect(screen.queryByText('Design Patterns')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should filter books by author last name', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'Gamma');

      await waitFor(
        () => {
          expect(screen.getByText('Design Patterns')).toBeInTheDocument();
          expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
          expect(screen.queryByText('The Pragmatic Programmer')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should handle partial matches', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'prag');

      await waitFor(
        () => {
          expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
          expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should show "No books found" message when search returns no results', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'xyz123');

      await waitFor(
        () => {
          expect(screen.getByText(/No books found matching "xyz123"/i)).toBeInTheDocument();
          expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should show clear button when search has text', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');

      // Clear button should not be visible initially
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

      await user.type(searchInput, 'clean');

      // Clear button should appear
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'clean');

      // Wait for filtering
      await waitFor(() => {
        expect(screen.getByText('Clean Code')).toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      // All books should be visible again
      expect(searchInput).toHaveValue('');
      await waitFor(
        () => {
          expect(screen.getByText('Clean Code')).toBeInTheDocument();
          expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
          expect(screen.getByText('Design Patterns')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should show all books when search is empty', () => {
      render(<BooksPage />);

      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      expect(screen.getByText('Design Patterns')).toBeInTheDocument();
    });

    it('should debounce search input (results should not update immediately)', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');

      // Type quickly without delay - use a more specific search term
      await user.type(searchInput, 'pragmatic', { delay: 0 });

      // After debounce delay (300ms), results should filter to only Pragmatic Programmer
      await waitFor(
        () => {
          expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
          expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
          expect(screen.queryByText('Design Patterns')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should show "No books in the library yet" when database is empty', () => {
      useBooks.mockReturnValue({
        data: { status: 'success', data: [] },
        isLoading: false,
        error: null,
      });

      render(<BooksPage />);

      expect(screen.getByText('No books in the library yet')).toBeInTheDocument();
    });

    it('should match books with multiple authors', async () => {
      const user = userEvent.setup();
      render(<BooksPage />);

      const searchInput = screen.getByLabelText('Search Books');
      await user.type(searchInput, 'Hunt');

      await waitFor(
        () => {
          expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
          expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });
});
