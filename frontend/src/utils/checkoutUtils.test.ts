import { describe, it, expect } from 'vitest';
import { formatDate, dueSoonSeverity, formatDueDateText } from './checkoutUtils';

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    expect(formatDate('2026-03-20T14:00:00.000Z')).toBe('Mar 20, 2026');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('dueSoonSeverity', () => {
  it('returns "error" for negative input (overdue)', () => {
    expect(dueSoonSeverity(-1)).toBe('error');
    expect(dueSoonSeverity(-5)).toBe('error');
  });

  it('returns "warning" for 0 (due today)', () => {
    expect(dueSoonSeverity(0)).toBe('warning');
  });

  it('returns "warning" for 1, 2, 3 (due soon)', () => {
    expect(dueSoonSeverity(1)).toBe('warning');
    expect(dueSoonSeverity(2)).toBe('warning');
    expect(dueSoonSeverity(3)).toBe('warning');
  });

  it('returns null for 4+ (not due soon)', () => {
    expect(dueSoonSeverity(4)).toBeNull();
    expect(dueSoonSeverity(10)).toBeNull();
    expect(dueSoonSeverity(100)).toBeNull();
  });

  it('returns null for null input', () => {
    expect(dueSoonSeverity(null)).toBeNull();
  });
});

describe('formatDueDateText', () => {
  it('returns "Due today" when daysUntilDue is 0', () => {
    expect(formatDueDateText(0, '2026-04-03')).toBe('Due today');
  });

  it('returns overdue text for negative daysUntilDue', () => {
    expect(formatDueDateText(-1, '2026-04-02')).toBe('1 day overdue');
    expect(formatDueDateText(-3, '2026-03-31')).toBe('3 days overdue');
  });

  it('returns days remaining for positive daysUntilDue', () => {
    expect(formatDueDateText(1, '2026-04-04')).toBe('1 day');
    expect(formatDueDateText(5, '2026-04-08')).toBe('5 days');
  });

  it('returns "No due date set" when dueDate is null', () => {
    expect(formatDueDateText(null, null)).toBe('No due date set');
  });

  it('returns "No due date set" when daysUntilDue is null', () => {
    expect(formatDueDateText(null, '2026-04-03')).toBe('No due date set');
  });
});
