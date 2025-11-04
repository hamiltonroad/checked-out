const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

/**
 * Book Routes
 * Base path: /api/v1/books
 */

// GET /api/v1/books - Get all books with authors
router.get('/', bookController.getAllBooks);

module.exports = router;
