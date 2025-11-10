const reviewService = require('../services/reviewService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Review Controller - HTTP handlers for review endpoints
 */
class ReviewController {
  /**
   * Create a new review for a book
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async createReview(req, res, next) {
    try {
      const { bookId } = req.params;
      const { rating, reviewText, patronId } = req.body;

      // Note: patronId is temporary until authentication is implemented
      // TODO: Replace with req.user.id when authentication is added
      const result = await reviewService.createReview(
        parseInt(bookId, 10),
        parseInt(patronId, 10),
        rating,
        reviewText
      );

      res.status(201).json(ApiResponse.success(result, 'Review created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing review
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, reviewText, patronId } = req.body;

      // Note: patronId is temporary until authentication is implemented
      // TODO: Replace with req.user.id when authentication is added
      const result = await reviewService.updateReview(
        parseInt(id, 10),
        parseInt(patronId, 10),
        rating,
        reviewText
      );

      res.json(ApiResponse.success(result, 'Review updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a review
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const { patronId } = req.query;

      // Note: patronId is temporary until authentication is implemented
      // TODO: Replace with req.user.id when authentication is added
      await reviewService.deleteReview(parseInt(id, 10), parseInt(patronId, 10));

      res.json(ApiResponse.success(null, 'Review deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reviews for a book
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async getReviewsByBook(req, res, next) {
    try {
      const { bookId } = req.params;
      const { limit, offset } = req.query;

      const result = await reviewService.getReviewsByBook(parseInt(bookId, 10), { limit, offset });

      res.json(ApiResponse.success(result, 'Reviews retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
