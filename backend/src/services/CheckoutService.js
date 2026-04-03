const { Checkout, Patron, Copy, Book } = require('../models');
const ApiError = require('../utils/ApiError');

const MS_PER_DAY = 86400000;

/**
 * Shared Sequelize include config for checkout queries with patron and book details
 */
const CHECKOUT_INCLUDES = [
  {
    model: Patron,
    as: 'patron',
    attributes: ['first_name', 'last_name'],
  },
  {
    model: Copy,
    as: 'copy',
    attributes: ['id'],
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['title'],
      },
    ],
  },
];

/**
 * Format a checkout record for API response
 * @param {Object} checkout - Sequelize checkout instance
 * @returns {Object} Formatted checkout object
 */
function formatCheckoutResponse(checkout) {
  return {
    id: checkout.id,
    patronName: `${checkout.patron.first_name} ${checkout.patron.last_name}`,
    bookTitle: checkout.copy.book.title,
    checkoutDate: checkout.checkout_date,
    returnDate: checkout.return_date,
  };
}

/**
 * Compute days until due from a due date
 * @param {Date|string|null} dueDate - The due date
 * @returns {number|null} Days until due (negative = overdue), or null
 */
function computeDaysUntilDue(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  due.setUTCHours(0, 0, 0, 0);
  return Math.ceil((due - today) / MS_PER_DAY);
}

/**
 * Format a current checkout record for API response
 * @param {Object} checkout - Sequelize checkout instance
 * @returns {Object} Formatted current checkout object with daysUntilDue
 */
function formatCurrentCheckoutResponse(checkout) {
  return {
    id: checkout.id,
    patronName: `${checkout.patron.first_name} ${checkout.patron.last_name}`,
    bookTitle: checkout.copy.book.title,
    checkoutDate: checkout.checkout_date,
    dueDate: checkout.due_date,
    daysUntilDue: computeDaysUntilDue(checkout.due_date),
    returnDate: checkout.return_date,
  };
}

class CheckoutService {
  /**
   * Create a new checkout record
   * @param {Object} params - Checkout parameters
   * @param {number} params.patronId - ID of the patron checking out
   * @param {number} params.copyId - ID of the copy being checked out
   * @returns {Promise<Object>} Created checkout record
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout({ patronId, copyId }) {
    const patron = await Patron.findByPk(patronId);
    if (!patron) {
      throw new ApiError(404, 'Patron not found');
    }

    const copy = await Copy.findByPk(copyId);
    if (!copy) {
      throw new ApiError(404, 'Copy not found');
    }

    const checkoutDate = new Date();
    const dueDate = new Date(checkoutDate);
    dueDate.setDate(dueDate.getDate() + 14);

    const checkout = await Checkout.create({
      copy_id: copyId,
      patron_id: patronId,
      checkout_date: checkoutDate,
      due_date: dueDate,
      return_date: null,
    });

    return checkout;
  }

  /**
   * Get only currently active checkouts (not yet returned) with due-date info
   * @returns {Promise<Array>} Array of formatted current checkout records
   */
  // eslint-disable-next-line class-methods-use-this
  async getCurrentCheckouts() {
    const checkouts = await Checkout.findAll({
      where: { return_date: null },
      include: CHECKOUT_INCLUDES,
      order: [['due_date', 'ASC']],
    });

    return checkouts.map(formatCurrentCheckoutResponse);
  }

  /**
   * Get all checkout records with patron and book details
   * @returns {Promise<Array>} Array of formatted checkout records
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllCheckouts() {
    const checkouts = await Checkout.findAll({
      include: CHECKOUT_INCLUDES,
      order: [['created_at', 'DESC']],
    });

    return checkouts.map(formatCheckoutResponse);
  }

  /**
   * Mark a checkout as returned
   * @param {number} id - Checkout ID
   * @returns {Promise<Object>} Updated checkout record
   */
  // eslint-disable-next-line class-methods-use-this
  async returnCheckout(id) {
    const checkout = await Checkout.findByPk(id, {
      include: CHECKOUT_INCLUDES,
    });

    if (!checkout) {
      throw ApiError.notFound('Checkout not found');
    }

    if (checkout.return_date) {
      throw ApiError.conflict('Checkout has already been returned');
    }

    // Conditional update for concurrency safety
    const [updatedCount] = await Checkout.update(
      { return_date: new Date() },
      { where: { id, return_date: null } }
    );

    if (updatedCount === 0) {
      throw ApiError.conflict('Checkout has already been returned');
    }

    await checkout.reload();

    return formatCheckoutResponse(checkout);
  }
}

module.exports = new CheckoutService();
