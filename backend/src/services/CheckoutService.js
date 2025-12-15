const { Checkout, Patron, Copy } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Checkout Service - Business logic for checkout operations
 */
class CheckoutService {
  /**
   * Create a new checkout record
   * @param {Object} checkoutData - Checkout data
   * @param {number} checkoutData.copyId - Copy ID
   * @param {number} checkoutData.patronId - Patron ID
   * @param {Date} [checkoutData.checkoutDate] - Checkout date (defaults to now)
   * @param {Date} [checkoutData.dueDate] - Due date (defaults to +14 days)
   * @returns {Promise<Object>} Created checkout record
   * @throws {ApiError} 404 if patron or copy not found
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout({ copyId, patronId, checkoutDate, dueDate }) {
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

    // Default checkout_date to now if not provided
    const finalCheckoutDate = checkoutDate || new Date();

    // Default due_date to checkout_date + 14 days if not provided
    const finalDueDate =
      dueDate || new Date(finalCheckoutDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Create checkout record
    const checkout = await Checkout.create({
      copy_id: copyId,
      patron_id: patronId,
      checkout_date: finalCheckoutDate,
      due_date: finalDueDate,
    });

    return checkout;
  }
}

module.exports = new CheckoutService();
