/**
 * Seed checkouts for comprehensive test data.
 * Creates 21 checkouts covering all scenarios:
 * 3 overdue, 3 due-soon, 5 active not-yet-due, 6 returned on time, 4 returned overdue.
 * Depends on seed-patrons and seed-copies having run first.
 * Idempotent: skips if checkouts for SEED- patrons already exist.
 */

const { ALL_SCENARIOS } = require('./data/seed-checkout-scenarios');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Convert a day offset to an absolute date.
 * Positive values = days in the past, negative values = days in the future.
 * @param {Date} now - Reference date
 * @param {number} daysAgo - Days offset (positive = past, negative = future)
 * @returns {Date}
 */
function resolveDate(now, daysAgo) {
  return new Date(now.getTime() - daysAgo * MS_PER_DAY);
}

/**
 * Build a checkout insert row from a scenario definition.
 * @param {object} scenario - Scenario from seed-checkout-scenarios
 * @param {number[]} copyIds - Array of copy IDs
 * @param {number[]} patronIds - Array of patron IDs
 * @param {Date} now - Reference date
 * @returns {object} Row ready for bulkInsert
 */
function buildCheckoutRow(scenario, copyIds, patronIds, now) {
  return {
    copy_id: copyIds[scenario.copyIdx],
    patron_id: patronIds[scenario.patronIdx],
    checkout_date: resolveDate(now, scenario.checkoutDaysAgo),
    due_date: resolveDate(now, scenario.dueDaysAgo),
    return_date: scenario.returnDaysAgo !== null ? resolveDate(now, scenario.returnDaysAgo) : null,
    created_at: now,
    updated_at: now,
  };
}

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    const patrons = await queryInterface.sequelize.query(
      "SELECT id FROM patrons WHERE card_number LIKE 'SEED-%' ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (patrons.length < 6) {
      return;
    }

    const copies = await queryInterface.sequelize.query(
      "SELECT id FROM copies WHERE barcode LIKE 'SEED-BC-%' OR kindle_asin LIKE 'SEED-%' ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (copies.length < 11) {
      return;
    }

    const patronIds = patrons.map((r) => r.id);

    // Idempotency: skip if checkouts for seed patrons already exist
    const existing = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM checkouts WHERE patron_id IN (:patronIds)',
      { replacements: { patronIds }, type: Sequelize.QueryTypes.SELECT }
    );

    if (parseInt(existing[0].count, 10) > 0) {
      return;
    }

    const now = new Date();
    const copyIds = copies.map((r) => r.id);
    const rows = ALL_SCENARIOS.map((s) => buildCheckoutRow(s, copyIds, patronIds, now));

    await queryInterface.bulkInsert('checkouts', rows);
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async down(queryInterface, Sequelize) {
    const patrons = await queryInterface.sequelize.query(
      "SELECT id FROM patrons WHERE card_number LIKE 'SEED-%'",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const patronIds = patrons.map((p) => p.id);

    if (patronIds.length > 0) {
      await queryInterface.bulkDelete('checkouts', {
        patron_id: { [Sequelize.Op.in]: patronIds },
      });
    }
  },
};
