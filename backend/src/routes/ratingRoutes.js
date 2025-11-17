const express = require('express');
const ratingController = require('../controllers/RatingController');
const { validateRating } = require('../validators/ratingValidators');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/books/:id/ratings', ratingController.getBookRatings);
router.get('/books/:id/ratings/stats', ratingController.getBookRatingStats);
router.get('/books/top-rated', ratingController.getTopRatedBooks);

// Protected routes - require authentication
router.use(authenticate); // All routes below require authentication

// Rating management for authenticated patrons
router.post('/ratings', validateRating, ratingController.submitRating);
router.get('/ratings/my-ratings', ratingController.getMyRatings);
router.get('/ratings/books/:bookId', ratingController.getMyRatingForBook);
router.delete('/ratings/books/:bookId', ratingController.deleteRating);

// Admin routes (could add admin middleware here)
router.get('/patrons/:patronId/ratings', ratingController.getPatronRatings);

module.exports = router;