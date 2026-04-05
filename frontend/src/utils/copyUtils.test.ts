import { describe, it, expect } from 'vitest';
import { getCopyCountText, getFormatAvailability } from './copyUtils';
import type { Copy } from '../types';

describe('getCopyCountText', () => {
  it('should return "No copies" for undefined', () => {
    expect(getCopyCountText(undefined)).toBe('No copies');
  });

  it('should return "No copies" for empty array', () => {
    expect(getCopyCountText([])).toBe('No copies');
  });

  it('should return "1 copy" for single copy', () => {
    const copies: Copy[] = [{ id: 1, book_id: 1, format: 'physical', checkouts: [] }];
    expect(getCopyCountText(copies)).toBe('1 copy');
  });

  it('should return "N copies" for multiple copies', () => {
    const copies: Copy[] = [
      { id: 1, book_id: 1, format: 'physical', checkouts: [] },
      { id: 2, book_id: 1, format: 'kindle', checkouts: [] },
      { id: 3, book_id: 1, format: 'physical', checkouts: [] },
    ];
    expect(getCopyCountText(copies)).toBe('3 copies');
  });
});

describe('getFormatAvailability', () => {
  it('should return empty array for undefined', () => {
    expect(getFormatAvailability(undefined)).toEqual([]);
  });

  it('should return empty array for empty copies', () => {
    expect(getFormatAvailability([])).toEqual([]);
  });

  it('should group by single format', () => {
    const copies: Copy[] = [
      { id: 1, book_id: 1, format: 'physical', checkouts: [] },
      { id: 2, book_id: 1, format: 'physical', checkouts: [] },
    ];
    const result = getFormatAvailability(copies);
    expect(result).toEqual([{ format: 'Physical', total: 2, available: 2 }]);
  });

  it('should group by multiple formats', () => {
    const copies: Copy[] = [
      { id: 1, book_id: 1, format: 'physical', checkouts: [] },
      { id: 2, book_id: 1, format: 'kindle', checkouts: [] },
      { id: 3, book_id: 1, format: 'physical', checkouts: [] },
    ];
    const result = getFormatAvailability(copies);
    expect(result).toEqual([
      { format: 'Physical', total: 2, available: 2 },
      { format: 'Kindle', total: 1, available: 1 },
    ]);
  });

  it('should count checked out copies as unavailable', () => {
    const copies: Copy[] = [
      {
        id: 1,
        book_id: 1,
        format: 'physical',
        checkouts: [{ id: 10, return_date: null }],
      },
      { id: 2, book_id: 1, format: 'physical', checkouts: [] },
    ];
    const result = getFormatAvailability(copies);
    expect(result).toEqual([{ format: 'Physical', total: 2, available: 1 }]);
  });

  it('should count returned checkouts as available', () => {
    const copies: Copy[] = [
      {
        id: 1,
        book_id: 1,
        format: 'kindle',
        checkouts: [{ id: 10, return_date: '2024-01-15' }],
      },
    ];
    const result = getFormatAvailability(copies);
    expect(result).toEqual([{ format: 'Kindle', total: 1, available: 1 }]);
  });

  it('should handle copy with no checkouts array as available', () => {
    const copies = [{ id: 1, book_id: 1, format: 'physical' }] as Copy[];
    const result = getFormatAvailability(copies);
    expect(result).toEqual([{ format: 'Physical', total: 1, available: 1 }]);
  });

  it('should handle mixed availability across formats', () => {
    const copies: Copy[] = [
      { id: 1, book_id: 1, format: 'physical', checkouts: [{ id: 10, return_date: null }] },
      { id: 2, book_id: 1, format: 'physical', checkouts: [] },
      { id: 3, book_id: 1, format: 'physical', checkouts: [{ id: 11, return_date: '2024-01-01' }] },
      { id: 4, book_id: 1, format: 'kindle', checkouts: [{ id: 12, return_date: null }] },
    ];
    const result = getFormatAvailability(copies);
    expect(result).toEqual([
      { format: 'Physical', total: 3, available: 2 },
      { format: 'Kindle', total: 1, available: 0 },
    ]);
  });
});
