const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const checkoutValidator = require('../validators/checkoutValidator');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

/**
 * Checkout Routes
 * Base path: /api/v1/checkouts
 */

// POST /api/v1/checkouts - Create a new checkout
router.post('/', validateRequest(checkoutValidator.create), checkoutController.createCheckout);

module.exports = router;
