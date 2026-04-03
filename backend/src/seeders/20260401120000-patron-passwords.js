/* eslint-disable no-unused-vars */
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../config/auth');

/**
 * Seed password hashes for existing demo patrons.
 * Default password for all dev patrons: "welcome123"
 */

const DEV_PASSWORD = 'welcome123';

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    const hash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

    const patrons = await queryInterface.sequelize.query(
      'SELECT id, card_number FROM patrons WHERE password_hash IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (patrons.length === 0) {
      console.log('No patrons need password hashes.'); // eslint-disable-line no-console
      return;
    }

    const ids = patrons.map((p) => p.id);

    await queryInterface.sequelize.query(
      `UPDATE patrons SET password_hash = :hash, updated_at = NOW() WHERE id IN (:ids)`,
      { replacements: { hash, ids } }
    );

    console.log(`Set password hash for ${patrons.length} patron(s). Dev password: ${DEV_PASSWORD}`); // eslint-disable-line no-console
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'UPDATE patrons SET password_hash = NULL, updated_at = NOW()'
    );
  },
};
