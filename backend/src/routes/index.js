const express = require('express');
const bookRoutes = require('./bookRoutes');
const reviewRoutes = require('./reviewRoutes');

const router = express.Router();

/**
 * API Routes Index
 * Base path: /api/v1
 */

// Register routes
router.use('/books', bookRoutes);
router.use('/', reviewRoutes); // Review routes are split between /books/:id/reviews and /reviews

module.exports = router;
