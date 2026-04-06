import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupMockRequire } from '../test-utils/mockRequire.js';

const { require, injectMock } = setupMockRequire(import.meta.url);

const transactionMock = vi.fn();

injectMock('../models', {
  sequelize: {
    transaction: (...args) => transactionMock(...args),
  },
  Sequelize: {
    Transaction: {
      ISOLATION_LEVELS: {
        SERIALIZABLE: 'SERIALIZABLE',
      },
    },
  },
});

const withSerializableTransaction = require('./withSerializableTransaction');

describe('withSerializableTransaction', () => {
  beforeEach(() => {
    transactionMock.mockReset();
  });

  it('invokes sequelize.transaction with SERIALIZABLE isolation level', async () => {
    transactionMock.mockImplementation(async (_options, cb) => cb({ id: 'tx-1' }));

    await withSerializableTransaction(async () => 'ok');

    expect(transactionMock).toHaveBeenCalledTimes(1);
    const [options] = transactionMock.mock.calls[0];
    expect(options).toEqual({ isolationLevel: 'SERIALIZABLE' });
  });

  it('returns the callback result on success', async () => {
    transactionMock.mockImplementation(async (_options, cb) => cb({ id: 'tx-1' }));

    const result = await withSerializableTransaction(async (tx) => ({ tx, value: 42 }));

    expect(result).toEqual({ tx: { id: 'tx-1' }, value: 42 });
  });

  it('propagates errors thrown by the callback (sequelize will roll back)', async () => {
    transactionMock.mockImplementation(async (_options, cb) => cb({ id: 'tx-1' }));

    await expect(
      withSerializableTransaction(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
  });
});
