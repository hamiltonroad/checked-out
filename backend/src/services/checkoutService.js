const { Checkout, Patron, Copy, Book } = require('../models');
const ApiError = require('../utils/ApiError');

class CheckoutService {
  /**
   * Create a new checkout
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(patronId, copyId) {
    // Validate patron exists
    const patron = await Patron.findByPk(patronId);
    if (!patron) {
      throw new ApiError(404, 'Patron not found');
    }

    // Validate copy exists
    const copy = await Copy.findByPk(copyId);
    if (!copy) {
      throw new ApiError(404, 'Copy not found');
    }

    // Calculate dates
    const checkoutDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

    // Create checkout record
    const checkout = await Checkout.create({
      patron_id: patronId,
      copy_id: copyId,
      checkout_date: checkoutDate,
      due_date: dueDate,
      return_date: null,
    });

    // Return checkout with related data
    const checkoutWithDetails = await Checkout.findByPk(checkout.id, {
      include: [
        {
          model: Patron,
          as: 'patron',
          attributes: ['id', 'card_number', 'first_name', 'last_name', 'email'],
        },
        {
          model: Copy,
          as: 'copy',
          attributes: ['id', 'format', 'copy_number', 'barcode'],
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title', 'isbn'],
            },
          ],
        },
      ],
    });

    return checkoutWithDetails;
  }
}

module.exports = new CheckoutService();
