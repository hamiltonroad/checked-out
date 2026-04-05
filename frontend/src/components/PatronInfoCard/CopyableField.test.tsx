import { render, screen, act, waitFor } from '@testing-library/react';

import { vi, describe, it, expect, beforeEach } from 'vitest';
import CopyableField from './CopyableField';
import { setupClipboardMock, setupResizeObserverMock } from '../../test/mockHelpers';

let mockWriteText: ReturnType<typeof vi.fn>;

describe('CopyableField', () => {
  beforeEach(() => {
    mockWriteText = setupClipboardMock();
    setupResizeObserverMock();
  });

  it('renders label and value', () => {
    render(<CopyableField label="Email" value="test@example.com" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows N/A for null value', () => {
    render(<CopyableField label="Phone" value={null} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('applies noWrap style for truncation', () => {
    render(<CopyableField label="Email" value="verylongemail@example.com" />);

    const valueEl = screen.getByText('verylongemail@example.com');
    expect(valueEl).toHaveClass('MuiTypography-noWrap');
  });

  it('renders copy button when copyable is true', () => {
    render(<CopyableField label="Email" value="test@example.com" copyable />);

    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
  });

  it('does not render copy button when copyable is false', () => {
    render(<CopyableField label="Phone" value="555-1234" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render copy button when value is null', () => {
    render(<CopyableField label="Email" value={null} copyable />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls clipboard API with correct value on copy click', async () => {
    render(<CopyableField label="Email" value="test@example.com" copyable />);

    await act(async () => {
      screen.getByRole('button', { name: 'Copy email' }).click();
    });

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows check icon after successful copy', async () => {
    render(<CopyableField label="Email" value="test@example.com" copyable />);

    await act(async () => {
      screen.getByRole('button', { name: 'Copy email' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
    });
  });
});
