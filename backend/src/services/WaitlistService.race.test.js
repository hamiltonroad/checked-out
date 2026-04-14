import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupMockRequire } from '../test-utils/mockRequire.js';

const { require, injectMock } = setupMockRequire(import.meta.url);

const mockWaitlistEntry = {
  findOne: vi.fn(),
  max: vi.fn(),
  create: vi.fn(),
};

const mockBook = { findByPk: vi.fn() };
const mockPatron = { findByPk: vi.fn() };

const mockTransaction = { id: 'tx-1' };
const transactionMock = vi.fn();

injectMock('../models', {
  WaitlistEntry: mockWaitlistEntry,
  Book: mockBook,
  Patron: mockPatron,
  Copy: {},
  sequelize: { transaction: transactionMock },
  Sequelize: {
    Transaction: { ISOLATION_LEVELS: { SERIALIZABLE: 'SERIALIZABLE' } },
  },
});

// Mock withSerializableTransaction to execute the callback directly with a mock transaction
injectMock('../utils/withSerializableTransaction', async (fn) => fn(mockTransaction));

const waitlistService = require('./WaitlistService');
const ApiError = require('../utils/ApiError');

const BOOK_ID = 1;
const FORMAT = 'physical';

function stubBookAndPatron(patronId) {
  mockBook.findByPk.mockResolvedValue({ id: BOOK_ID });
  mockPatron.findByPk.mockResolvedValue({ id: patronId, status: 'active' });
}

describe('WaitlistService.joinQueue race conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('two different patrons joining concurrently get distinct positions', async () => {
    let callCount = 0;
    mockWaitlistEntry.findOne.mockResolvedValue(null);
    mockWaitlistEntry.max.mockImplementation(async () => {
      callCount += 1;
      return callCount === 1 ? 0 : 1;
    });
    mockWaitlistEntry.create.mockImplementation(async (data) => ({ ...data, id: data.position }));

    stubBookAndPatron(10);
    const p1 = waitlistService.joinQueue(10, BOOK_ID, FORMAT);

    stubBookAndPatron(20);
    const p2 = waitlistService.joinQueue(20, BOOK_ID, FORMAT);

    const results = await Promise.allSettled([p1, p2]);

    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('fulfilled');
    expect(results[0].value.position).not.toBe(results[1].value.position);
  });

  it('rejects with 409 when patron already has a waiting entry', async () => {
    mockWaitlistEntry.findOne.mockImplementation(async ({ where }) => {
      if (where.status === 'waiting') {
        return { id: 1, patron_id: 10, book_id: BOOK_ID, format: FORMAT, status: 'waiting' };
      }
      return null;
    });

    stubBookAndPatron(10);

    await expect(waitlistService.joinQueue(10, BOOK_ID, FORMAT)).rejects.toThrow(
      'Already on the waitlist for this book and format'
    );

    const error = await waitlistService.joinQueue(10, BOOK_ID, FORMAT).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(409);
    expect(mockWaitlistEntry.create).not.toHaveBeenCalled();
  });

  it('soft-resets a stale entry instead of creating a duplicate', async () => {
    const staleEntry = {
      id: 5,
      patron_id: 10,
      book_id: BOOK_ID,
      format: FORMAT,
      status: 'notified',
      update: vi.fn().mockResolvedValue(undefined),
    };

    mockWaitlistEntry.findOne.mockImplementation(async ({ where }) => {
      if (where.status === 'waiting') return null;
      return staleEntry;
    });
    mockWaitlistEntry.max.mockResolvedValue(3);

    stubBookAndPatron(10);
    const result = await waitlistService.joinQueue(10, BOOK_ID, FORMAT);

    expect(result).toBe(staleEntry);
    expect(staleEntry.update).toHaveBeenCalledWith(
      { status: 'waiting', position: 4 },
      { transaction: mockTransaction }
    );
    expect(mockWaitlistEntry.create).not.toHaveBeenCalled();
  });

  it('creates a new entry when no existing entry is found', async () => {
    mockWaitlistEntry.findOne.mockResolvedValue(null);
    mockWaitlistEntry.max.mockResolvedValue(2);
    mockWaitlistEntry.create.mockImplementation(async (data) => ({ ...data, id: 99 }));

    stubBookAndPatron(10);
    const result = await waitlistService.joinQueue(10, BOOK_ID, FORMAT);

    expect(result.position).toBe(3);
    expect(result.status).toBe('waiting');
    expect(mockWaitlistEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ patron_id: 10, position: 3, status: 'waiting' }),
      { transaction: mockTransaction }
    );
  });
});
