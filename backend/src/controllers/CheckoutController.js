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

  /**
   * Get current (active) checkouts
   * GET /api/v1/checkouts/current
   */
  // eslint-disable-next-line class-methods-use-this
  async getCurrentCheckouts(req, res, next) {
    try {
      const checkouts = await checkoutService.getCurrentCheckouts();

      res
        .status(200)
        .json(ApiResponse.success(checkouts, 'Current checkouts retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all checkouts
   * GET /api/v1/checkouts
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllCheckouts(req, res, next) {
    try {
      const checkouts = await checkoutService.getAllCheckouts();

      res.status(200).json(ApiResponse.success(checkouts, 'Checkouts retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Return a checked-out book
   * PUT /api/v1/checkouts/:id/return
   */
  // eslint-disable-next-line class-methods-use-this
  async returnCheckout(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);

      const checkout = await checkoutService.returnCheckout(id);

      res.status(200).json(ApiResponse.success(checkout, 'Book returned successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckoutController();
