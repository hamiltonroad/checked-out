import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import WaitlistCard from './WaitlistCard';
import type { WaitlistEntryData } from '../../types';

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

const defaultProps = {
  onBookClick: vi.fn(),
  onLeave: vi.fn(),
  isLeaving: false,
};

describe('WaitlistCard', () => {
  it('renders book title and format chip', () => {
    render(<WaitlistCard entry={makeEntry()} {...defaultProps} />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Physical')).toBeInTheDocument();
  });

  it('renders Kindle format label for kindle entries', () => {
    render(<WaitlistCard entry={makeEntry({ format: 'kindle' })} {...defaultProps} />);

    expect(screen.getByText('Kindle')).toBeInTheDocument();
  });

  it('displays position and queue size', () => {
    render(<WaitlistCard entry={makeEntry({ position: 3, queue_size: 7 })} {...defaultProps} />);

    expect(screen.getByText('Position: #3 of 7')).toBeInTheDocument();
  });

  it('displays total copies with correct pluralization', () => {
    render(<WaitlistCard entry={makeEntry({ total_copies: 1 })} {...defaultProps} />);
    expect(screen.getByText('1 copy')).toBeInTheDocument();
  });

  it('displays plural copies label for multiple copies', () => {
    render(<WaitlistCard entry={makeEntry({ total_copies: 3 })} {...defaultProps} />);
    expect(screen.getByText('3 copies')).toBeInTheDocument();
  });

  it('shows "Next in line" chip when position is 1', () => {
    render(<WaitlistCard entry={makeEntry({ position: 1 })} {...defaultProps} />);

    expect(screen.getByText('Next in line')).toBeInTheDocument();
  });

  it('does not show "Next in line" chip when position is not 1', () => {
    render(<WaitlistCard entry={makeEntry({ position: 2 })} {...defaultProps} />);

    expect(screen.queryByText('Next in line')).not.toBeInTheDocument();
  });

  it('calls onBookClick when title is clicked', async () => {
    const user = userEvent.setup();
    const onBookClick = vi.fn();

    render(<WaitlistCard entry={makeEntry()} {...defaultProps} onBookClick={onBookClick} />);

    await user.click(screen.getByText('Test Book'));
    expect(onBookClick).toHaveBeenCalledWith(100);
  });

  it('opens confirm dialog and calls onLeave after confirming', async () => {
    const user = userEvent.setup();
    const onLeave = vi.fn();

    render(<WaitlistCard entry={makeEntry()} {...defaultProps} onLeave={onLeave} />);

    await user.click(screen.getByRole('button', { name: 'Leave Waitlist' }));
    expect(screen.getByRole('heading', { name: 'Leave waitlist?', level: 2 })).toBeInTheDocument();
    expect(onLeave).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Leave' }));
    expect(onLeave).toHaveBeenCalledWith(100, 'physical');
  });

  it('cancels the confirm dialog without calling onLeave', async () => {
    const user = userEvent.setup();
    const onLeave = vi.fn();

    render(<WaitlistCard entry={makeEntry()} {...defaultProps} onLeave={onLeave} />);

    await user.click(screen.getByRole('button', { name: 'Leave Waitlist' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onLeave).not.toHaveBeenCalled();
  });

  it('disables leave button and shows loading text when isLeaving is true', () => {
    render(<WaitlistCard entry={makeEntry()} {...defaultProps} isLeaving={true} />);

    const button = screen.getByRole('button', { name: 'Leaving...' });
    expect(button).toBeDisabled();
  });

  it('shows "Unknown Book" when book title is missing', () => {
    render(<WaitlistCard entry={makeEntry({ book: undefined })} {...defaultProps} />);

    expect(screen.getByText('Unknown Book')).toBeInTheDocument();
  });

  it('shows fallback for missing queue_size', () => {
    render(<WaitlistCard entry={makeEntry({ queue_size: undefined })} {...defaultProps} />);

    expect(screen.getByText('Position: #2 of ?')).toBeInTheDocument();
  });

  it('shows 0 copies when total_copies is undefined', () => {
    render(<WaitlistCard entry={makeEntry({ total_copies: undefined })} {...defaultProps} />);

    expect(screen.getByText('0 copies')).toBeInTheDocument();
  });

  it('displays the joined date', () => {
    render(<WaitlistCard entry={makeEntry()} {...defaultProps} />);

    expect(screen.getByText(/Joined/)).toBeInTheDocument();
  });
});
