const { Checkout, Patron, Copy } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Checkout Service - Business logic for checkout operations
 */
class CheckoutService {
  /**
   * Create a new checkout
   * @param {number} patronId - ID of the patron checking out
   * @param {number} copyId - ID of the copy being checked out
   * @returns {Promise<Object>} Created checkout with patron and copy data
   * @throws {ApiError} 404 if patron or copy not found
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(patronId, copyId) {
    // Validate patron exists
    const patron = await Patron.findByPk(patronId);
    if (!patron) {
      throw ApiError.notFound(`Patron with ID ${patronId} not found`);
    }

    // Validate copy exists
    const copy = await Copy.findByPk(copyId);
    if (!copy) {
      throw ApiError.notFound(`Copy with ID ${copyId} not found`);
    }

    // Calculate dates
    const checkoutDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days

    // Create checkout record
    const checkout = await Checkout.create({
      patron_id: patronId,
      copy_id: copyId,
      checkout_date: checkoutDate,
      due_date: dueDate,
      return_date: null,
    });

    // Return checkout with associations
    const result = await Checkout.findByPk(checkout.id, {
      include: [
        {
          model: Patron,
          as: 'patron',
        },
        {
          model: Copy,
          as: 'copy',
        },
      ],
    });

    return result;
  }
}

module.exports = new CheckoutService();
