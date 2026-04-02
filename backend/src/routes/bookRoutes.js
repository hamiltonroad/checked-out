const express = require('express');
const bookController = require('../controllers/bookController');
const bookValidator = require('../validators/bookValidator');
const validateRequest = require('../middlewares/validateRequest');
const { standardLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * Book Routes
 * Base path: /api/v1/books
 */

// GET /api/v1/books - Get all books with authors
router.get('/', standardLimiter, validateRequest(bookValidator.getAll), bookController.getAllBooks);

// GET /api/v1/books/:id - Get a single book by ID with authors
router.get(
  '/:id',
  standardLimiter,
  validateRequest(bookValidator.getById),
  bookController.getBookById
);

module.exports = router;
