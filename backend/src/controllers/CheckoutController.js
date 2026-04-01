const checkoutService = require('../services/CheckoutService');
const ApiResponse = require('../utils/ApiResponse');

class CheckoutController {
  /**
   * Create a new checkout
   * POST /api/v1/checkouts
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(req, res, next) {
    try {
      const { patron_id: patronId, copy_id: copyId } = req.body;

      const checkout = await checkoutService.createCheckout({
        patronId,
        copyId,
      });

      res.status(201).json(ApiResponse.success(checkout, 'Checkout created successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckoutController();
