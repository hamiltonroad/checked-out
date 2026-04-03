import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';
import SearchOffIcon from '@mui/icons-material/SearchOff';

describe('EmptyState', () => {
  const defaultProps = {
    icon: <SearchOffIcon data-testid="search-off-icon" />,
    title: 'No Results Found',
    message: 'Try adjusting your search or filters',
  };

  it('renders with required props', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByTestId('search-off-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No Results Found' })).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
  });

  it('renders without action button when action prop is not provided', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with action button when action prop is provided', () => {
    const mockAction = {
      label: 'Add Book',
      onClick: vi.fn(),
    };

    render(<EmptyState {...defaultProps} action={mockAction} />);

    const button = screen.getByRole('button', { name: 'Add Book' });
    expect(button).toBeInTheDocument();
  });

  it('calls action onClick handler when button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    const mockAction = {
      label: 'Add Book',
      onClick: mockOnClick,
    };

    render(<EmptyState {...defaultProps} action={mockAction} />);

    const button = screen.getByRole('button', { name: 'Add Book' });
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<EmptyState {...defaultProps} />);

    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('displays different icons correctly', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;

    render(
      <EmptyState icon={<CustomIcon />} title="Custom Empty State" message="Custom message" />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Custom Empty State' })).toBeInTheDocument();
  });

  it('displays long messages correctly', () => {
    const longMessage =
      'This is a very long message that should wrap properly and display correctly within the maximum width constraints of the component.';

    render(<EmptyState {...defaultProps} message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('button has proper aria-label for accessibility', () => {
    const mockAction = {
      label: 'Clear Filters',
      onClick: vi.fn(),
    };

    render(<EmptyState {...defaultProps} action={mockAction} />);

    const button = screen.getByRole('button', { name: 'Clear Filters' });
    expect(button).toHaveAttribute('aria-label', 'Clear Filters');
  });
});
