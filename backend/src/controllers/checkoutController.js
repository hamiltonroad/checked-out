const checkoutService = require('../services/checkoutService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Checkout Controller - HTTP handlers for checkout endpoints
 */
class CheckoutController {
  /**
   * Create a new checkout
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(req, res, next) {
    try {
      // eslint-disable-next-line camelcase
      const { patron_id, copy_id } = req.body;
      // eslint-disable-next-line camelcase
      const result = await checkoutService.createCheckout(patron_id, copy_id);
      res.json(ApiResponse.success(result, 'Checkout created successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckoutController();
