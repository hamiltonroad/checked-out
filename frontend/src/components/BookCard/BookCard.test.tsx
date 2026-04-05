import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BookCard from './BookCard';
import { mockBook, createMockOnClick } from './BookCard.test.helpers';

// Mock useOverflowDetection at module level
const mockIsOverflowing = { value: false };
vi.mock('../../hooks/useOverflowDetection', () => ({
  useOverflowDetection: () => ({
    contentRef: { current: null },
    isOverflowing: mockIsOverflowing.value,
  }),
}));

describe('BookCard', () => {
  let mockOnClick: ReturnType<typeof createMockOnClick>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOverflowing.value = false;
    mockOnClick = createMockOnClick();
  });

  it('should render book title correctly', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
  });

  it('should render single author correctly', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('should render multiple authors as comma-separated list', () => {
    const book = {
      ...mockBook,
      authors: [
        { first_name: 'John', last_name: 'Doe' },
        { first_name: 'Jane', last_name: 'Smith' },
      ],
    };
    render(<BookCard book={book} onClick={mockOnClick} />);
    expect(screen.getByText('John Doe, Jane Smith')).toBeInTheDocument();
  });

  it('should render copy count text', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    expect(screen.getByText('2 copies')).toBeInTheDocument();
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
    const styles = window.getComputedStyle(card!);
    expect(styles.cursor).toBe('pointer');
  });

  it('should render with base elevation of 1', () => {
    const { container } = render(<BookCard book={mockBook} onClick={mockOnClick} />);
    const card = container.querySelector('.MuiPaper-elevation1');
    expect(card).toBeInTheDocument();
  });

  it('should render "No copies" when copies array is empty', () => {
    render(<BookCard book={{ ...mockBook, copies: [] }} onClick={mockOnClick} />);
    expect(screen.getByText('No copies')).toBeInTheDocument();
  });

  it('should render "1 copy" for a single copy', () => {
    const book = {
      ...mockBook,
      copies: [{ id: 1, book_id: 1, format: 'physical', checkouts: [] }],
    };
    render(<BookCard book={book} onClick={mockOnClick} />);
    expect(screen.getByText('1 copy')).toBeInTheDocument();
  });

  it('should render "No copies" when copies is undefined', () => {
    render(<BookCard book={{ ...mockBook, copies: undefined }} onClick={mockOnClick} />);
    expect(screen.getByText('No copies')).toBeInTheDocument();
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

  // Genre placeholder tests
  it('should render genre placeholder area', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    expect(screen.getByTestId('genre-placeholder')).toBeInTheDocument();
  });

  it('should render genre placeholder with icon', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    const placeholder = screen.getByTestId('genre-placeholder');
    expect(placeholder.querySelector('svg')).toBeInTheDocument();
  });

  it('should render default placeholder when genre is undefined', () => {
    render(<BookCard book={{ ...mockBook, genre: undefined }} onClick={mockOnClick} />);
    const placeholder = screen.getByTestId('genre-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.querySelector('svg')).toBeInTheDocument();
  });
});
