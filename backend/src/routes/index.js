const express = require('express');
const bookRoutes = require('./bookRoutes');
const ratingRoutes = require('./ratingRoutes');
const checkoutRoutes = require('./checkoutRoutes');

const router = express.Router();

/**
 * API Routes Index
 * Base path: /api/v1
 */

// Register routes
router.use('/books', bookRoutes);
router.use('/checkouts', checkoutRoutes);
router.use('/', ratingRoutes);

module.exports = router;
