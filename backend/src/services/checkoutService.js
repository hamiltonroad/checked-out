const { Checkout, Patron, Copy, Book } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * CheckoutService - Business logic for checkout operations
 */
class CheckoutService {
  /**
   * Create a new checkout record
   * @param {number} copyId - ID of the copy being checked out
   * @param {number} patronId - ID of the patron checking out the book
   * @returns {Promise<Object>} Created checkout with associated data
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(copyId, patronId) {
    // Validate patron exists
    const patron = await Patron.findByPk(patronId);
    if (!patron) {
      throw ApiError.notFound(`Patron with ID ${patronId} not found`);
    }

    // Validate copy exists
    const copy = await Copy.findByPk(copyId, {
      include: [{ model: Book, as: 'book' }],
    });
    if (!copy) {
      throw ApiError.notFound(`Copy with ID ${copyId} not found`);
    }

    // Calculate dates
    const checkoutDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // +14 days

    // Create checkout record
    const checkout = await Checkout.create({
      copy_id: copyId,
      patron_id: patronId,
      checkout_date: checkoutDate,
      due_date: dueDate,
      return_date: null,
    });

    // Return checkout with associations
    const result = await Checkout.findByPk(checkout.id, {
      include: [
        { model: Patron, as: 'patron' },
        { model: Copy, as: 'copy', include: [{ model: Book, as: 'book' }] },
      ],
    });

    return result;
  }
}

module.exports = new CheckoutService();
