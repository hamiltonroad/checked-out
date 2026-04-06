const checkoutService = require('../services/CheckoutService');
const patronCheckoutService = require('../services/PatronCheckoutService');
const holdService = require('../services/HoldService');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../config/logger');

/** Log client-facing errors at warn level for observability */
function logClientError(error, req, label) {
  if (error.statusCode && error.statusCode < 500) {
    logger.warn(label, {
      statusCode: error.statusCode,
      message: error.message,
      method: req.method,
      url: req.originalUrl,
    });
  }
}

class CheckoutController {
  /**
   * Create a new checkout
   * POST /api/v1/checkouts
   */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout(req, res, next) {
    try {
      const { copy_id: copyId } = req.body;

      const patronId = req.patron.id;

      const checkout = await checkoutService.createCheckout({
        patronId,
        copyId,
      });

      res.status(201).json(ApiResponse.success(checkout, 'Checkout created successfully'));
    } catch (error) {
      logClientError(error, req, 'Checkout validation failure');
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
   * Get overdue checkouts
   * GET /api/v1/checkouts/overdue
   */
  // eslint-disable-next-line class-methods-use-this
  async getOverdueCheckouts(req, res, next) {
    try {
      const checkouts = await checkoutService.getOverdueCheckouts();

      res
        .status(200)
        .json(ApiResponse.success(checkouts, 'Overdue checkouts retrieved successfully'));
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
      const { returnDate } = req.body || {};

      const checkout = await checkoutService.returnCheckout(id, returnDate || null);

      // Orchestrate hold creation for front-of-line waitlist patron (ADR-008)
      if (checkout.copy_id) {
        await holdService.expireStaleHolds([checkout.copy_id]);
        const hold = await holdService.createHoldForFrontOfLine(checkout.copy_id);
        if (hold) {
          logger.info('Hold created on return for front-of-line patron', {
            holdId: hold.id,
            copyId: checkout.copy_id,
          });
        }
      }

      res.status(200).json(ApiResponse.success(checkout, 'Book returned successfully'));
    } catch (error) {
      logClientError(error, req, 'Return validation failure');
      next(error);
    }
  }

  /**
   * Get checkouts for a specific patron
   * GET /api/v1/checkouts/patron/:id
   */
  // eslint-disable-next-line class-methods-use-this
  async getCheckoutsByPatron(req, res, next) {
    try {
      const patronId = parseInt(req.params.id, 10);
      const { status } = req.query;

      const checkouts = await patronCheckoutService.getByPatronId(patronId, status || null);

      res
        .status(200)
        .json(ApiResponse.success(checkouts, 'Patron checkouts retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckoutController();
