const express = require('express');
const authRoutes = require('./authRoutes');
const authorRoutes = require('./authorRoutes');
const bookRoutes = require('./bookRoutes');
const ratingRoutes = require('./ratingRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const copyRoutes = require('./copyRoutes');
const patronRoutes = require('./patronRoutes');
const wishlistRoutes = require('./wishlistRoutes');

const router = express.Router();

/**
 * API Routes Index
 * Base path: /api/v1
 */

// Register routes
router.use('/auth', authRoutes);
router.use('/authors', authorRoutes);
router.use('/books', bookRoutes);
router.use('/', ratingRoutes);
router.use('/checkouts', checkoutRoutes);
router.use('/copies', copyRoutes);
router.use('/patrons', patronRoutes);
router.use('/', wishlistRoutes);

module.exports = router;
