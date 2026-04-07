const express = require('express');
const copyController = require('../controllers/CopyController');
const validateRequest = require('../middlewares/validateRequest');
const copyValidator = require('../validators/copyValidator');
const { standardLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * Copy Routes
 * Base path: /api/v1/copies
 */

// GET /api/v1/copies/checkoutable - Get copies free of active checkouts and
// front-of-line waitlist gating. Read-only discovery hint — not a reservation.
router.get(
  '/checkoutable',
  standardLimiter,
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
