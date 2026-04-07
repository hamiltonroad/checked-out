const bcrypt = require('bcrypt');
const { SALT_ROUNDS, DEV_PASSWORD } = require('../config/auth');
const { FIRST_NAMES, LAST_NAMES } = require('./data/patron-names');

/**
 * Bulk patron seeder — creates 5,000 realistic patron records for testing.
 * All patrons use the canonical dev password from config/auth.js (bcrypt-hashed).
 * Card numbers use BULK-XXXXX format to avoid collision with demo patrons.
 * Idempotent: skips if bulk patrons already exist.
 */
const PATRON_COUNT = 5000;
const BULK_CARD_PREFIX = 'BULK-';
const IDEMPOTENCY_THRESHOLD = 100;

/**
 * Determine patron status using weighted distribution.
 * 80% active, 10% inactive, 10% suspended.
 * @param {number} index - Patron index (0-based)
 * @returns {string} Status string
 */
function getStatus(index) {
  const bucket = index % 10;
  if (bucket >= 8) {
    return bucket === 8 ? 'inactive' : 'suspended';
  }
  return 'active';
}

/**
 * Generate a zero-padded card number.
 * @param {number} index - 1-based patron index
 * @returns {string} Card number in BULK-XXXXX format
 */
function formatCardNumber(index) {
  return `${BULK_CARD_PREFIX}${String(index).padStart(5, '0')}`;
}

/**
 * Generate a phone number from index.
 * @param {number} index - 1-based patron index
 * @returns {string} Phone in 555-XXX-XXXX format
 */
function formatPhone(index) {
  const prefix = String(index % 10000)
    .padStart(4, '0')
    .slice(0, 3);
  const suffix = String(index).padStart(4, '0').slice(-4);
  return `555-${prefix}-${suffix}`;
}

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    // Idempotency check: skip if patrons already exist beyond demo count
    const results = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM patrons', {
      type: Sequelize.QueryTypes.SELECT,
    });
    const patronCount = parseInt(results[0].count, 10);

    if (patronCount > IDEMPOTENCY_THRESHOLD) {
      console.log(
        `Skipping bulk patron seed: ${patronCount} patrons already exist (threshold: ${IDEMPOTENCY_THRESHOLD}).`
      );
      return;
    }

    // Hash the password once and reuse for all records
    const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);
    const now = new Date();

    const firstNameCount = FIRST_NAMES.length;
    const lastNameCount = LAST_NAMES.length;

    const patrons = [];
    for (let i = 0; i < PATRON_COUNT; i += 1) {
      const firstName = FIRST_NAMES[i % firstNameCount];
      const lastName = LAST_NAMES[Math.floor(i / firstNameCount) % lastNameCount];
      const cardIndex = i + 1;

      patrons.push({
        card_number: formatCardNumber(cardIndex),
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${cardIndex}@example.com`,
        phone: formatPhone(cardIndex),
        status: getStatus(i),
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      });
    }

    await queryInterface.bulkInsert('patrons', patrons);

    console.log(
      `Seeded ${PATRON_COUNT} bulk patrons (card numbers ${BULK_CARD_PREFIX}00001 to ${BULK_CARD_PREFIX}05000).`
    );
    console.log(`Dev password for all bulk patrons: ${DEV_PASSWORD}`);
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('patrons', {
      card_number: { [Sequelize.Op.like]: `${BULK_CARD_PREFIX}%` },
    });
    console.log('Removed all bulk patron records.');
  },
};
