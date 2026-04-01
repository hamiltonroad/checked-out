const { Checkout, Patron, Copy } = require('../models');
const ApiError = require('../utils/ApiError');

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
}

module.exports = new CheckoutService();
