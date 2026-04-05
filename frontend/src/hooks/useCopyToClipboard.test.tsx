import { render, screen, act, waitFor } from '@testing-library/react';

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCopyToClipboard } from './useCopyToClipboard';

const mockWriteText = vi.fn().mockResolvedValue(undefined);

function TestComponent() {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  return (
    <div>
      <button onClick={() => copyToClipboard('test-text')}>Copy</button>
      <span data-testid="status">{isCopied ? 'copied' : 'idle'}</span>
    </div>
  );
}

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    mockWriteText.mockClear().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls navigator.clipboard.writeText with correct text', async () => {
    render(<TestComponent />);

    await act(async () => {
      screen.getByRole('button', { name: 'Copy' }).click();
    });

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('test-text');
    });
  });

  it('sets isCopied to true after successful copy', async () => {
    render(<TestComponent />);

    await act(async () => {
      screen.getByRole('button', { name: 'Copy' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('copied');
    });
  });

  it('resets isCopied after timeout', async () => {
    vi.useFakeTimers();
    render(<TestComponent />);

    await act(async () => {
      screen.getByRole('button', { name: 'Copy' }).click();
      await Promise.resolve();
    });

    expect(screen.getByTestId('status').textContent).toBe('copied');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('handles clipboard API failure gracefully', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard access denied'));
    render(<TestComponent />);

    await act(async () => {
      screen.getByRole('button', { name: 'Copy' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('idle');
    });
  });

  it('cleans up timeout on unmount', async () => {
    vi.useFakeTimers();
    const { unmount } = render(<TestComponent />);

    await act(async () => {
      screen.getByRole('button', { name: 'Copy' }).click();
      await Promise.resolve();
    });

    expect(screen.getByTestId('status').textContent).toBe('copied');

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });
});
