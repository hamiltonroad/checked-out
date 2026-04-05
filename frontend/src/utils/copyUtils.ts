import type { Copy } from '../types';

export interface FormatAvailability {
  format: string;
  total: number;
  available: number;
}

/**
 * Returns a human-readable copy count string (e.g., "No copies", "1 copy", "3 copies")
 */
export function getCopyCountText(copies?: Copy[]): string {
  if (!copies || copies.length === 0) return 'No copies';
  if (copies.length === 1) return '1 copy';
  return `${copies.length} copies`;
}

/**
 * Determines whether a single copy is currently available (not checked out)
 */
function isCopyAvailable(copy: Copy): boolean {
  if (!copy.checkouts || copy.checkouts.length === 0) return true;
  return copy.checkouts.every((checkout) => checkout.return_date !== null);
}

/**
 * Groups copies by format and returns availability counts for each format
 */
export function getFormatAvailability(copies?: Copy[]): FormatAvailability[] {
  if (!copies || copies.length === 0) return [];

  const formatMap = new Map<string, { total: number; available: number }>();

  for (const copy of copies) {
    const format = copy.format;
    const entry = formatMap.get(format) || { total: 0, available: 0 };
    entry.total += 1;
    if (isCopyAvailable(copy)) {
      entry.available += 1;
    }
    formatMap.set(format, entry);
  }

  return Array.from(formatMap.entries()).map(([format, counts]) => ({
    format: format.charAt(0).toUpperCase() + format.slice(1),
    ...counts,
  }));
}
