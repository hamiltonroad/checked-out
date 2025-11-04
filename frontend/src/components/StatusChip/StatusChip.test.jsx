import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import StatusChip from './StatusChip';

describe('StatusChip', () => {
  it('should render available status with green chip', () => {
    render(<StatusChip status="available" />);

    const chip = screen.getByText('Available');
    expect(chip).toBeInTheDocument();
  });

  it('should render checked_out status with orange chip', () => {
    render(<StatusChip status="checked_out" />);

    const chip = screen.getByText('Checked Out');
    expect(chip).toBeInTheDocument();
  });

  it('should render overdue status with red chip', () => {
    render(<StatusChip status="overdue" />);

    const chip = screen.getByText('Overdue');
    expect(chip).toBeInTheDocument();
  });

  it('should render with small size by default', () => {
    const { container } = render(<StatusChip status="available" />);

    const chip = container.querySelector('.MuiChip-sizeSmall');
    expect(chip).toBeInTheDocument();
  });

  it('should render with medium size when specified', () => {
    const { container } = render(<StatusChip status="available" size="medium" />);

    const chip = container.querySelector('.MuiChip-sizeMedium');
    expect(chip).toBeInTheDocument();
  });

  it('should fallback to available status for invalid status', () => {
    // Suppress PropTypes warning for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<StatusChip status="invalid_status" />);

    const chip = screen.getByText('Available');
    expect(chip).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should display CheckCircleIcon for available status', () => {
    const { container } = render(<StatusChip status="available" />);

    const icon = container.querySelector('.MuiChip-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should display EventBusyIcon for checked_out status', () => {
    const { container } = render(<StatusChip status="checked_out" />);

    const icon = container.querySelector('.MuiChip-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should display ErrorIcon for overdue status', () => {
    const { container } = render(<StatusChip status="overdue" />);

    const icon = container.querySelector('.MuiChip-icon');
    expect(icon).toBeInTheDocument();
  });
});
