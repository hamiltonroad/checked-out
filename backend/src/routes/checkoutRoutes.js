const express = require('express');
const checkoutController = require('../controllers/CheckoutController');
const validateRequest = require('../middlewares/validateRequest');
const checkoutValidator = require('../validators/checkoutValidator');
const { standardLimiter, strictLimiter } = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.get(
  '/current',
  standardLimiter,
  authenticate,
  requireRole(ROLES.LIBRARIAN),
  checkoutController.getCurrentCheckouts
);
router.get(
  '/patron/:id',
  standardLimiter,
  authenticate,
  requireRole(ROLES.LIBRARIAN),
  validateRequest(checkoutValidator.getByPatron),
  checkoutController.getCheckoutsByPatron
);
router.get(
  '/overdue',
  standardLimiter,
  authenticate,
  requireRole(ROLES.LIBRARIAN),
  checkoutController.getOverdueCheckouts
);
router.get('/', standardLimiter, checkoutController.getAllCheckouts);
router.post(
  '/',
  strictLimiter,
  authenticate,
  requireRole(ROLES.LIBRARIAN),
  validateRequest(checkoutValidator.create),
  checkoutController.createCheckout
);
router.put(
  '/:id/return',
  strictLimiter,
  authenticate,
  requireRole(ROLES.LIBRARIAN),
  validateRequest(checkoutValidator.return),
  checkoutController.returnCheckout
);

module.exports = router;
