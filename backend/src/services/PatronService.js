const { Patron } = require('../models');
const ApiError = require('../utils/ApiError');

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

  /**
   * Retrieve a single patron by ID
   * @param {number} id - Patron ID
   * @returns {Promise<Object>} Patron object with all public fields
   * @throws {ApiError} 404 if patron not found
   */
  // eslint-disable-next-line class-methods-use-this
  async getPatronById(id) {
    const patron = await Patron.findByPk(id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'card_number', 'status'],
    });

    if (!patron) {
      throw ApiError.notFound('Patron not found');
    }

    return patron;
  }
}

module.exports = new PatronService();
