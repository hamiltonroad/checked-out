const express = require('express');
const authorController = require('../controllers/AuthorController');
const authorValidator = require('../validators/authorValidator');
const validateRequest = require('../middlewares/validateRequest');
const { standardLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * Author Routes
 * Base path: /api/v1/authors
 */

// GET /api/v1/authors - Get all authors for autocomplete
router.get(
  '/',
  standardLimiter,
  validateRequest(authorValidator.getAll),
  authorController.getAllAuthors
);

module.exports = router;
