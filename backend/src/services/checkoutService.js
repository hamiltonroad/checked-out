const { Checkout, Patron, Copy } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Checkout Service - Business logic for checkout operations
 */
class CheckoutService {
  /**
   * Create a new checkout record
   * @param {Object} data - Checkout data
   * @param {number} data.patron_id - ID of the patron checking out
   * @param {number} data.copy_id - ID of the copy being checked out
   * @param {Date} [data.due_date] - Optional due date (defaults to +14 days)
   * @returns {Promise<Object>} Created checkout with patron and copy associations
   * @throws {ApiError} 404 if patron or copy not found
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(data) {
    // eslint-disable-next-line camelcase
    const { patron_id, copy_id, due_date } = data;

    // Validate patron exists
    const patron = await Patron.findByPk(patron_id);
    if (!patron) {
      throw ApiError.notFound(`Patron with ID ${patron_id} not found`);
    }

    // Validate copy exists
    const copy = await Copy.findByPk(copy_id);
    if (!copy) {
      throw ApiError.notFound(`Copy with ID ${copy_id} not found`);
    }

    // Calculate due date if not provided (14 days from now)
    const checkoutDate = new Date();
    const calculatedDueDate = due_date
      ? new Date(due_date)
      : new Date(checkoutDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Create checkout record
    const checkout = await Checkout.create({
      patron_id, // eslint-disable-line camelcase
      copy_id, // eslint-disable-line camelcase
      checkout_date: checkoutDate,
      due_date: calculatedDueDate, // eslint-disable-line camelcase
      return_date: null,
    });

    // Fetch complete checkout with associations
    const completeCheckout = await Checkout.findByPk(checkout.id, {
      include: [
        {
          model: Patron,
          as: 'patron',
          attributes: ['id', 'card_number', 'first_name', 'last_name'],
        },
        {
          model: Copy,
          as: 'copy',
          attributes: ['id', 'book_id', 'format', 'copy_number'],
        },
      ],
    });

    return completeCheckout;
  }
}

module.exports = new CheckoutService();
