import type { DueSeverity } from '../types';

/**
 * Determine the severity level for a due date based on days until due.
 * @param daysUntilDue - Days until the item is due (negative = overdue), or null
 * @returns 'error' for overdue, 'warning' for due within 3 days, null otherwise
 */
export function dueSoonSeverity(daysUntilDue: number | null): DueSeverity {
  if (daysUntilDue === null) return null;
  if (daysUntilDue < 0) return 'error';
  if (daysUntilDue <= 3) return 'warning';
  return null;
}

/**
 * Format the due date display text based on days until due.
 * @param daysUntilDue - Days until the item is due (negative = overdue), or null
 * @param dueDate - The raw due date string, or null
 * @returns Human-readable due date status string
 */
export function formatDueDateText(daysUntilDue: number | null, dueDate: string | null): string {
  if (dueDate === null) return 'No due date set';
  if (daysUntilDue === null) return 'No due date set';
  if (daysUntilDue === 0) return 'Due today';
  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);
    return `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`;
  }
  return `${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`;
}
