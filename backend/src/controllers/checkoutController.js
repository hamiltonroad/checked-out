const checkoutService = require('../services/checkoutService');
const ApiResponse = require('../utils/ApiResponse');

class CheckoutController {
  /**
   * Create a new checkout
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(req, res, next) {
    try {
      const { patronId, copyId } = req.body;

      const checkout = await checkoutService.createCheckout(patronId, copyId);

      res.status(201).json(ApiResponse.success(checkout, 'Book checked out successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckoutController();
