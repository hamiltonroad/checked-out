import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BookCard from './BookCard';
import { mockBook, createMockOnClick } from './BookCard.test.helpers';

const mockIsOverflowing = { value: false };
vi.mock('../../hooks/useOverflowDetection', () => ({
  useOverflowDetection: () => ({
    contentRef: { current: null },
    isOverflowing: mockIsOverflowing.value,
  }),
}));

describe('BookCard expand/collapse', () => {
  let mockOnClick: ReturnType<typeof createMockOnClick>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOverflowing.value = false;
    mockOnClick = createMockOnClick();
  });

  it('should not show expand button when content fits', () => {
    mockIsOverflowing.value = false;
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    expect(screen.queryByLabelText('Show more')).not.toBeInTheDocument();
  });

  it('should show expand button when content overflows', () => {
    mockIsOverflowing.value = true;
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    expect(screen.getByLabelText('Show more')).toBeInTheDocument();
  });

  it('should have correct aria-expanded attribute on expand button', () => {
    mockIsOverflowing.value = true;
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    const btn = screen.getByLabelText('Show more');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('should expand card when expand button is clicked', async () => {
    mockIsOverflowing.value = true;
    const user = userEvent.setup();
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    await user.click(screen.getByLabelText('Show more'));
    expect(screen.getByLabelText('Show less')).toBeInTheDocument();
    expect(screen.getByLabelText('Show less')).toHaveAttribute('aria-expanded', 'true');
  });

  it('should collapse card when collapse button is clicked', async () => {
    mockIsOverflowing.value = true;
    const user = userEvent.setup();
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    await user.click(screen.getByLabelText('Show more'));
    await user.click(screen.getByLabelText('Show less'));
    expect(screen.getByLabelText('Show more')).toBeInTheDocument();
  });

  it('should not trigger card onClick when expand button is clicked', async () => {
    mockIsOverflowing.value = true;
    const user = userEvent.setup();
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    await user.click(screen.getByLabelText('Show more'));
    // onClick should not be called since stopPropagation is used
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should have accessible title attributes on truncated text', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    expect(screen.getByTitle('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByTitle('F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('should render content area with data-testid', () => {
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    expect(screen.getByTestId('book-card-content')).toBeInTheDocument();
  });

  it('should render expand icon inside expand button when collapsed', () => {
    mockIsOverflowing.value = true;
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    const btn = screen.getByLabelText('Show more');
    expect(within(btn).getByTestId('ExpandMoreIcon')).toBeInTheDocument();
  });

  it('should render collapse icon inside button when expanded', async () => {
    mockIsOverflowing.value = true;
    const user = userEvent.setup();
    render(<BookCard book={mockBook} onClick={mockOnClick} />);

    await user.click(screen.getByLabelText('Show more'));
    const btn = screen.getByLabelText('Show less');
    expect(within(btn).getByTestId('ExpandLessIcon')).toBeInTheDocument();
  });
});
