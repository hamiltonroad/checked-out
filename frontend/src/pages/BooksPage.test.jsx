import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BooksPage from './BooksPage';
import { useBooks } from '../hooks/useBooks';

vi.mock('../hooks/useBooks');

describe('BooksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
