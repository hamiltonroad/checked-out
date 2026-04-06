/**
 * Wrap a callback in a Sequelize SERIALIZABLE transaction.
 *
 * Use this for any service operation that reads an aggregate (`MAX`, `COUNT`,
 * `MIN`) and then writes based on the result. Without serializable isolation,
 * concurrent callers can each observe the same aggregate value and produce
 * duplicate / out-of-order writes (waitlist position, checkout slot, etc.).
 *
 * See Issue #228 Recommendation #1.
 *
 * @param {(transaction: import('sequelize').Transaction) => Promise<any>} fn
 *   Callback receiving a Sequelize transaction. Must pass it to every
 *   read/write operation that participates in the unit of work.
 * @returns {Promise<any>} The resolved value of `fn`.
 */
const { sequelize, Sequelize } = require('../models');

async function withSerializableTransaction(fn) {
  return sequelize.transaction(
    { isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    (transaction) => fn(transaction)
  );
}

module.exports = withSerializableTransaction;
