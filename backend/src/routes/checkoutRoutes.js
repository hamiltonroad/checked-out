const express = require('express');
const checkoutController = require('../controllers/CheckoutController');
const validateRequest = require('../middlewares/validateRequest');
const checkoutValidator = require('../validators/checkoutValidator');
const { standardLimiter, strictLimiter } = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/current', standardLimiter, authenticate, checkoutController.getCurrentCheckouts);
router.get('/', standardLimiter, checkoutController.getAllCheckouts);
router.post(
  '/',
  strictLimiter,
  validateRequest(checkoutValidator.create),
  checkoutController.createCheckout
);
router.put('/:id/return', strictLimiter, checkoutController.returnCheckout);

module.exports = router;
