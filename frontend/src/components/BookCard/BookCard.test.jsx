import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BookCard from './BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: 1,
    title: 'The Great Gatsby',
    authors: [{ first_name: 'F. Scott', last_name: 'Fitzgerald' }],
    status: 'available',
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render book title correctly', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const title = screen.getByText('The Great Gatsby');
    expect(title).toBeInTheDocument();
  });

  it('should render single author correctly', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const author = screen.getByText('F. Scott Fitzgerald');
    expect(author).toBeInTheDocument();
  });

  it('should render multiple authors as comma-separated list', () => {
    const bookWithMultipleAuthors = {
      ...mockBook,
      authors: [
        { first_name: 'John', last_name: 'Doe' },
        { first_name: 'Jane', last_name: 'Smith' },
      ],
    };

    render(<BookCard book={bookWithMultipleAuthors} onClick={mockOnClick} />);

    const authors = screen.getByText('John Doe, Jane Smith');
    expect(authors).toBeInTheDocument();
  });

  it('should render StatusChip with correct status', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const statusChip = screen.getByText('Available');
    expect(statusChip).toBeInTheDocument();
  });

  it('should call onClick with book id when card is clicked', async () => {
    const user = userEvent.setup();
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const card = screen.getByRole('button', { name: /view details for the great gatsby/i });
    await user.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it('should have cursor pointer style', () => {
    const { container } = render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const card = container.querySelector('.MuiCard-root');
    const styles = window.getComputedStyle(card);
    expect(styles.cursor).toBe('pointer');
  });

  it('should render with base elevation of 1', () => {
    const { container } = render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const card = container.querySelector('.MuiPaper-elevation1');
    expect(card).toBeInTheDocument();
  });

  it('should render different book statuses correctly', () => {
    const checkedOutBook = { ...mockBook, status: 'checked_out' };
    const { rerender } = render(<BookCard book={checkedOutBook} onClick={mockOnClick} />);

    expect(screen.getByText('Checked Out')).toBeInTheDocument();

    const overdueBook = { ...mockBook, status: 'overdue' };
    rerender(<BookCard book={overdueBook} onClick={mockOnClick} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  // Keyboard accessibility tests
  it('should activate card when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const card = screen.getByRole('button', { name: /view details for the great gatsby/i });
    card.focus();
    await user.keyboard('{Enter}');

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it('should activate card when Space key is pressed', async () => {
    const user = userEvent.setup();
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const card = screen.getByRole('button', { name: /view details for the great gatsby/i });
    card.focus();
    await user.keyboard(' ');

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it('should be keyboard focusable with tabIndex', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should have accessible role and aria-label', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    const card = screen.getByRole('button', { name: /view details for the great gatsby/i });
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('aria-label', 'View details for The Great Gatsby');
  });
});
