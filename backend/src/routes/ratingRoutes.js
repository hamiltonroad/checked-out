const express = require('express');
const ratingController = require('../controllers/RatingController');
const { validateRating } = require('../validators/ratingValidators');
const { authenticate } = require('../middlewares/auth');
const { standardLimiter, strictLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Public routes (standard tier)
router.get('/books/:id/ratings', standardLimiter, ratingController.getBookRatings);
router.get('/books/:id/ratings/stats', standardLimiter, ratingController.getBookRatingStats);
router.get('/books/top-rated', standardLimiter, ratingController.getTopRatedBooks);

// Protected routes - require authentication
router.use(authenticate); // All routes below require authentication

// Rating management for authenticated patrons
router.post('/ratings', strictLimiter, validateRating, ratingController.submitRating);
router.get('/ratings/my-ratings', standardLimiter, ratingController.getMyRatings);
router.get('/ratings/books/:bookId', standardLimiter, ratingController.getMyRatingForBook);
router.delete('/ratings/books/:bookId', strictLimiter, ratingController.deleteRating);

// Admin routes (could add admin middleware here)
router.get('/patrons/:patronId/ratings', standardLimiter, ratingController.getPatronRatings);

module.exports = router;
