const express = require('express');
const bookRoutes = require('./bookRoutes');

const router = express.Router();

/**
 * API Routes Index
 * Base path: /api/v1
 */

// Register routes
router.use('/books', bookRoutes);

module.exports = router;
