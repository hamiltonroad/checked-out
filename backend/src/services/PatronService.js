const { Op } = require('sequelize');
const { Patron } = require('../models');
const ApiError = require('../utils/ApiError');
const escapeLikeWildcards = require('../utils/escapeLikeWildcards');

/**
 * Service for patron-related business logic
 */
class PatronService {
  /**
   * Retrieve patrons, optionally filtered by status
   * @param {Object} [options] - Filter options
   * @param {string} [options.status] - Filter by patron status (e.g. 'active')
   * @returns {Promise<Array>} Array of patron objects with id, first_name, last_name, card_number, status
   */
  // eslint-disable-next-line class-methods-use-this
  async getActivePatrons({ status } = {}) {
    const where = {};
    if (status) {
      where.status = status;
    }

    return Patron.findAll({
      where,
      attributes: ['id', 'first_name', 'last_name', 'card_number', 'status'],
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
      ],
    });
  }

  /**
   * Search patrons by partial first name, last name, or card number
   * @param {string} query - Search term (min 2 characters)
   * @param {number} [limit=10] - Maximum results to return
   * @returns {Promise<Array>} Matching active patrons
   */
  // eslint-disable-next-line class-methods-use-this
  async searchPatrons(query, limit = 10) {
    const escaped = escapeLikeWildcards(query);
    return Patron.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { first_name: { [Op.like]: `%${escaped}%` } },
          { last_name: { [Op.like]: `%${escaped}%` } },
          { card_number: { [Op.like]: `%${escaped}%` } },
        ],
      },
      attributes: ['id', 'first_name', 'last_name', 'card_number'],
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
      ],
      limit,
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
