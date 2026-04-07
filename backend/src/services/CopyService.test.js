import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupMockRequire } from '../test-utils/mockRequire.js';

const { require, injectMock } = setupMockRequire(import.meta.url);

const mockCopy = { findAll: vi.fn() };
const mockSequelize = { literal: vi.fn((s) => ({ __literal: s })) };

const mockModels = {
  Copy: mockCopy,
  Checkout: {},
  Book: {},
  WaitlistEntry: {},
  sequelize: mockSequelize,
};

injectMock('../models', mockModels);

const copyService = require('./CopyService');

function buildCopy({ id, bookId, format, title }) {
  return {
    id,
    book_id: bookId,
    copy_number: 1,
    format,
    barcode: null,
    kindle_asin: null,
    book: { id: bookId, title },
  };
}

describe('CopyService.findCheckoutable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty list when DB query yields no rows', async () => {
    mockCopy.findAll.mockResolvedValue([]);

    const result = await copyService.findCheckoutable({ limit: 10 });

    expect(result).toEqual({ copies: [], count: 0 });
  });

  it('maps DB rows to the response shape (asin alias, nested book)', async () => {
    mockCopy.findAll.mockResolvedValue([
      buildCopy({ id: 2, bookId: 20, format: 'kindle', title: 'Book B' }),
    ]);

    const result = await copyService.findCheckoutable({ limit: 10 });

    expect(result.count).toBe(1);
    expect(result.copies[0]).toMatchObject({
      id: 2,
      format: 'kindle',
      asin: null,
      book: { id: 20, title: 'Book B' },
    });
  });

  it('applies bookId and format filters to the where clause', async () => {
    mockCopy.findAll.mockResolvedValue([]);

    await copyService.findCheckoutable({ bookId: 42, format: 'kindle', limit: 5 });

    expect(mockCopy.findAll).toHaveBeenCalledTimes(1);
    const callArgs = mockCopy.findAll.mock.calls[0][0];
    expect(callArgs.where.book_id).toBe(42);
    expect(callArgs.where.format).toBe('kindle');
  });

  it('passes limit to Copy.findAll (push-down, not slice)', async () => {
    mockCopy.findAll.mockResolvedValue([]);

    await copyService.findCheckoutable({ limit: 7 });

    const callArgs = mockCopy.findAll.mock.calls[0][0];
    expect(callArgs.limit).toBe(7);
  });

  it('uses NOT EXISTS subqueries for checkout and waitlist gating', async () => {
    mockCopy.findAll.mockResolvedValue([]);

    await copyService.findCheckoutable({});

    // Two literal subqueries are constructed: one for checkouts, one for waitlist.
    expect(mockSequelize.literal).toHaveBeenCalledTimes(2);
    const literals = mockSequelize.literal.mock.calls.map((c) => c[0]);
    expect(literals.some((s) => s.includes('checkouts') && s.includes('return_date IS NULL'))).toBe(
      true
    );
    expect(
      literals.some(
        (s) =>
          s.includes('waitlist_entries') &&
          s.includes("status = 'waiting'") &&
          s.includes('position = 1')
      )
    ).toBe(true);
  });

  it('returns copies free of gating unchanged', async () => {
    mockCopy.findAll.mockResolvedValue([
      buildCopy({ id: 7, bookId: 99, format: 'physical', title: 'Quiet' }),
    ]);

    const result = await copyService.findCheckoutable({});

    expect(result.count).toBe(1);
    expect(result.copies[0]).toMatchObject({
      id: 7,
      format: 'physical',
      book: { id: 99, title: 'Quiet' },
    });
  });
});
