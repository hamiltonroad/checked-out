import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatronInfoCard from './PatronInfoCard';
import type { PatronDetail } from '../../types';

const mockWriteText = vi.fn().mockResolvedValue(undefined);

const mockPatron: PatronDetail = {
  id: 1,
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@example.com',
  phone: '555-123-4567',
  card_number: 'LIB-00001',
  status: 'active',
};

describe('PatronInfoCard', () => {
  beforeEach(() => {
    mockWriteText.mockClear().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
    window.ResizeObserver = class MockResizeObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    } as unknown as typeof ResizeObserver;
  });

  it('renders patron full name', () => {
    render(<PatronInfoCard patron={mockPatron} />);

    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument();
  });

  it('renders status chip with correct label', () => {
    render(<PatronInfoCard patron={mockPatron} />);

    const activeElements = screen.getAllByText('Active');
    expect(activeElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all four info fields', () => {
    render(<PatronInfoCard patron={mockPatron} />);

    expect(screen.getByText('Card Number')).toBeInTheDocument();
    expect(screen.getByText('LIB-00001')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('555-123-4567')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders copy buttons for email and card number only', () => {
    render(<PatronInfoCard patron={mockPatron} />);

    const copyButtons = screen.getAllByRole('button');
    expect(copyButtons).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Copy card number' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
  });

  it('shows N/A for null email', () => {
    const patronNoEmail = { ...mockPatron, email: null };
    render(<PatronInfoCard patron={patronNoEmail} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders suspended status correctly', () => {
    const suspendedPatron = { ...mockPatron, status: 'suspended' as const };
    render(<PatronInfoCard patron={suspendedPatron} />);

    const suspendedElements = screen.getAllByText('Suspended');
    expect(suspendedElements.length).toBeGreaterThanOrEqual(1);
  });
});
