const checkoutService = require('../services/CheckoutService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Checkout Controller - HTTP handlers for checkout endpoints
 */
class CheckoutController {
  /**
   * Create a new checkout record
   * Body Parameters:
   * - copy_id: ID of the copy to check out (required)
   * - patron_id: ID of the patron checking out (required)
   * - checkout_date: Date of checkout (optional, defaults to now)
   * - due_date: Due date for return (optional, defaults to +14 days)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(req, res, next) {
    try {
      const {
        copy_id: copyId,
        patron_id: patronId,
        checkout_date: checkoutDate,
        due_date: dueDate,
      } = req.body;
      const result = await checkoutService.createCheckout({
        copyId,
        patronId,
        checkoutDate,
        dueDate,
      });
      res.status(201).json(ApiResponse.success(result, 'Checkout created successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckoutController();
