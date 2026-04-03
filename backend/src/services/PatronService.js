const { Patron } = require('../models');

/**
 * Service for patron-related business logic
 */
class PatronService {
  /**
   * Retrieve patrons, optionally filtered by status
   * @param {Object} [options] - Filter options
   * @param {string} [options.status] - Filter by patron status (e.g. 'active')
   * @returns {Promise<Array>} Array of patron objects with id, first_name, last_name, card_number
   */
  // eslint-disable-next-line class-methods-use-this
  async getActivePatrons({ status } = {}) {
    const where = {};
    if (status) {
      where.status = status;
    }

    return Patron.findAll({
      where,
      attributes: ['id', 'first_name', 'last_name', 'card_number'],
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
      ],
    });
  }
}

module.exports = new PatronService();
