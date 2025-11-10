const express = require('express');
const reviewController = require('../controllers/reviewController');
const reviewValidator = require('../validators/reviewValidator');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

/**
 * Review routes
 * Base path: /api/v1/
 */

// Create a review for a book
router.post(
  '/books/:bookId/reviews',
  validateRequest(reviewValidator.createReview),
  reviewController.createReview
);

// Update a review
router.put(
  '/reviews/:id',
  validateRequest(reviewValidator.updateReview),
  reviewController.updateReview
);

// Delete a review
router.delete(
  '/reviews/:id',
  validateRequest(reviewValidator.deleteReview),
  reviewController.deleteReview
);

// Get all reviews for a book
router.get(
  '/books/:bookId/reviews',
  validateRequest(reviewValidator.getReviewsByBook),
  reviewController.getReviewsByBook
);

module.exports = router;
