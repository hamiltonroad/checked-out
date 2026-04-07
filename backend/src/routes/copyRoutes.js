const express = require('express');
const copyController = require('../controllers/CopyController');
const validateRequest = require('../middlewares/validateRequest');
const copyValidator = require('../validators/copyValidator');
const { standardLimiter } = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * Copy Routes
 * Base path: /api/v1/copies
 */

// GET /api/v1/copies/checkoutable - Get copies free of active checkouts and
// front-of-line waitlist gating. Read-only discovery hint — not a reservation.
// Authenticated: response includes physical-asset identifiers (barcode, asin)
// which should not be exposed to anonymous callers.
router.get(
  '/checkoutable',
  standardLimiter,
  authenticate,
  validateRequest(copyValidator.checkoutableQuery),
  copyController.getCheckoutable
);

// GET /api/v1/copies/book/:bookId/available - Get available copies for a book
router.get(
  '/book/:bookId/available',
  standardLimiter,
  validateRequest(copyValidator.getAvailableByBook),
  copyController.getAvailableCopies
);

module.exports = router;
