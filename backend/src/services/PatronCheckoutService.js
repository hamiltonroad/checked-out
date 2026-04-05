const { Op } = require('sequelize');
const { Checkout, Patron, Copy, Book, Author, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Sequelize include config for patron checkout queries with book and author details
 */
const PATRON_CHECKOUT_INCLUDES = [
  {
    model: Copy,
    as: 'copy',
    attributes: ['id'],
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['title'],
        include: [
          {
            model: Author,
            as: 'authors',
            attributes: ['first_name', 'last_name'],
            through: { attributes: [] },
          },
        ],
      },
    ],
  },
];

/**
 * Format author names into a single string
 * @param {Array} authors - Array of author objects
 * @returns {string} Formatted author string
 */
function formatAuthors(authors) {
  if (!authors || authors.length === 0) return 'Unknown Author';
  return authors.map((a) => `${a.first_name} ${a.last_name}`).join(', ');
}

/**
 * Format a patron checkout record for API response
 * @param {Object} checkout - Sequelize checkout instance
 * @returns {Object} Formatted patron checkout object
 */
function formatPatronCheckoutResponse(checkout) {
  return {
    id: checkout.id,
    bookTitle: checkout.copy.book.title,
    author: formatAuthors(checkout.copy.book.authors),
    checkoutDate: checkout.checkout_date,
    dueDate: checkout.due_date,
    returnedAt: checkout.return_date,
    status: checkout.return_date ? 'returned' : 'checked_out',
  };
}

/**
 * Service for patron-specific checkout queries
 */
class PatronCheckoutService {
  /**
   * Get checkouts for a specific patron, with optional status filter
   * @param {number} patronId - Patron ID
   * @param {string|null} status - 'current' | 'returned' | null (all)
   * @returns {Promise<Array>} Array of formatted patron checkout records
   * @throws {ApiError} 404 if patron does not exist
   */
  // eslint-disable-next-line class-methods-use-this
  async getByPatronId(patronId, status = null) {
    const patron = await Patron.findByPk(patronId);
    if (!patron) {
      throw ApiError.notFound('Patron not found');
    }

    const where = { patron_id: patronId };

    if (status === 'current') {
      where.return_date = null;
    } else if (status === 'returned') {
      where.return_date = { [Op.ne]: null };
    }

    const order = status === 'returned' ? [['return_date', 'DESC']] : [['checkout_date', 'DESC']];

    const checkouts = await Checkout.findAll({
      where,
      include: PATRON_CHECKOUT_INCLUDES,
      order,
    });

    return checkouts.map(formatPatronCheckoutResponse);
  }

  /**
   * Get recently checked-out-to patrons (excluding the current user)
   * @param {number} currentPatronId - The authenticated patron's ID
   * @param {number} [limit=5] - Maximum patrons to return
   * @returns {Promise<Array>} Recent patron records
   */
  // eslint-disable-next-line class-methods-use-this
  async getRecentPatrons(currentPatronId, limit = 5) {
    const recentCheckouts = await Checkout.findAll({
      where: { patron_id: { [Op.ne]: currentPatronId } },
      attributes: ['patron_id', [sequelize.fn('MAX', sequelize.col('checkout_date')), 'latest']],
      group: ['patron_id'],
      order: [[sequelize.fn('MAX', sequelize.col('checkout_date')), 'DESC']],
      limit,
      raw: true,
    });

    if (recentCheckouts.length === 0) {
      return [];
    }

    const patronIds = recentCheckouts.map((c) => c.patron_id);

    const patrons = await Patron.findAll({
      where: { id: { [Op.in]: patronIds }, status: 'active' },
      attributes: ['id', 'first_name', 'last_name', 'card_number'],
    });

    // Preserve recency order from the checkout query
    const patronMap = new Map(patrons.map((p) => [p.id, p]));
    return patronIds.map((id) => patronMap.get(id)).filter(Boolean);
  }
}

module.exports = new PatronCheckoutService();
