const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const checkoutValidator = require('../validators/checkoutValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * Checkout Routes
 * Base path: /api/v1/checkouts
 */

// POST /api/v1/checkouts - Create a new checkout (requires authentication)
router.post(
  '/',
  authenticate,
  validateRequest(checkoutValidator.create),
  checkoutController.createCheckout
);

module.exports = router;
