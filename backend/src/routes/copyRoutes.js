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

// GET /api/v1/copies/book/:bookId/available - Get available copies for a book
router.get(
  '/book/:bookId/available',
  standardLimiter,
  validateRequest(copyValidator.getAvailableByBook),
  copyController.getAvailableCopies
);

module.exports = router;
