import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupMockRequire } from '../test-utils/mockRequire.js';

const { require, injectMock } = setupMockRequire(import.meta.url);

const mockCopy = { findAll: vi.fn() };
const mockWaitlistEntry = { findAll: vi.fn() };

const mockModels = {
  Copy: mockCopy,
  Checkout: {},
  Book: {},
  WaitlistEntry: mockWaitlistEntry,
};

injectMock('../models', mockModels);

const copyService = require('./CopyService');

function buildCopy({ id, bookId, format, checkouts = [], title }) {
  return {
    id,
    book_id: bookId,
    copy_number: 1,
    format,
    barcode: null,
    kindle_asin: null,
    checkouts,
    book: { id: bookId, title },
  };
}

describe('CopyService.findCheckoutable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty list when all copies are actively checked out', async () => {
    mockCopy.findAll.mockResolvedValue([
      buildCopy({
        id: 1,
        bookId: 10,
        format: 'physical',
        title: 'Book A',
        checkouts: [{ id: 99, return_date: null }],
      }),
    ]);
    mockWaitlistEntry.findAll.mockResolvedValue([]);

    const result = await copyService.findCheckoutable({ limit: 10 });

    expect(result).toEqual({ copies: [], count: 0 });
  });

  it('excludes copies whose (book, format) has a front-of-line waitlist entry', async () => {
    mockCopy.findAll.mockResolvedValue([
      buildCopy({ id: 1, bookId: 10, format: 'physical', title: 'Book A' }),
      buildCopy({ id: 2, bookId: 20, format: 'kindle', title: 'Book B' }),
    ]);
    mockWaitlistEntry.findAll.mockResolvedValue([{ book_id: 10, format: 'physical' }]);

    const result = await copyService.findCheckoutable({ limit: 10 });

    expect(result.count).toBe(1);
    expect(result.copies[0].id).toBe(2);
    expect(result.copies[0].book).toEqual({ id: 20, title: 'Book B' });
  });

  it('applies bookId and format filters to Copy.findAll', async () => {
    mockCopy.findAll.mockResolvedValue([]);
    mockWaitlistEntry.findAll.mockResolvedValue([]);

    await copyService.findCheckoutable({ bookId: 42, format: 'kindle', limit: 5 });

    expect(mockCopy.findAll).toHaveBeenCalledTimes(1);
    const callArgs = mockCopy.findAll.mock.calls[0][0];
    expect(callArgs.where).toEqual({ book_id: 42, format: 'kindle' });
  });

  it('honors limit by slicing results', async () => {
    const rows = [1, 2, 3, 4, 5].map((id) =>
      buildCopy({ id, bookId: id, format: 'physical', title: `Book ${id}` })
    );
    mockCopy.findAll.mockResolvedValue(rows);
    mockWaitlistEntry.findAll.mockResolvedValue([]);

    const result = await copyService.findCheckoutable({ limit: 2 });

    expect(result.count).toBe(2);
    expect(result.copies.map((c) => c.id)).toEqual([1, 2]);
  });

  it('returns copies free of active checkouts unchanged', async () => {
    mockCopy.findAll.mockResolvedValue([
      buildCopy({ id: 7, bookId: 99, format: 'physical', title: 'Quiet' }),
    ]);
    mockWaitlistEntry.findAll.mockResolvedValue([]);

    const result = await copyService.findCheckoutable({});

    expect(result.count).toBe(1);
    expect(result.copies[0]).toMatchObject({
      id: 7,
      format: 'physical',
      book: { id: 99, title: 'Quiet' },
    });
  });
});
