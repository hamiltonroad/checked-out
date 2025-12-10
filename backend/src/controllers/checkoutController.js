const checkoutService = require('../services/checkoutService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * CheckoutController - HTTP handlers for checkout endpoints
 */
class CheckoutController {
  /**
   * Create a new checkout
   * POST /api/v1/checkouts
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(req, res, next) {
    try {
      const { copyId, patronId } = req.body;

      const result = await checkoutService.createCheckout(copyId, patronId);

      res.json(ApiResponse.success(result, 'Book checked out successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckoutController();
