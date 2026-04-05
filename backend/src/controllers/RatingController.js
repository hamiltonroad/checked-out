const ratingService = require('../services/RatingService');
const ratingStatsService = require('../services/RatingStatsService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

class RatingController {
  /**
   * Submit or update a rating
   */
  // eslint-disable-next-line class-methods-use-this
  async submitRating(req, res, next) {
    try {
      const { bookId, rating, reviewText } = req.body;
      const patronId = req.patron && req.patron.id; // Assuming authentication middleware sets req.patron

      if (!patronId) {
        throw new ApiError(401, 'Authentication required');
      }

      const result = await ratingService.createOrUpdateRating({
        bookId,
        patronId,
        rating,
        reviewText,
      });

      res.status(201).json(ApiResponse.success(result, 'Rating submitted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all ratings for a specific book
   */
  // eslint-disable-next-line class-methods-use-this
  async getBookRatings(req, res, next) {
    try {
      const { id: bookId } = req.params;
      const { limit = 10, offset = 0, includeReviews = 'true' } = req.query;

      const ratingsResult = await ratingService.getBookRatings(bookId, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        includeReviews: includeReviews === 'true',
      });
      const stats = await ratingStatsService.getBookRatingStats(bookId);

      res.json(ApiResponse.success({ ...ratingsResult, stats }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get rating statistics for a book
   */
  // eslint-disable-next-line class-methods-use-this
  async getBookRatingStats(req, res, next) {
    try {
      const { id: bookId } = req.params;
      const stats = await ratingStatsService.getBookRatingStats(bookId);

      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current patron's ratings
   */
  // eslint-disable-next-line class-methods-use-this
  async getMyRatings(req, res, next) {
    try {
      const patronId = req.patron && req.patron.id;

      if (!patronId) {
        throw new ApiError(401, 'Authentication required');
      }

      const { limit = 10, offset = 0 } = req.query;

      const result = await ratingService.getPatronRatings(patronId, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific rating by the current patron for a book
   */
  // eslint-disable-next-line class-methods-use-this
  async getMyRatingForBook(req, res, next) {
    try {
      const { bookId } = req.params;
      const patronId = req.patron && req.patron.id;

      if (!patronId) {
        throw new ApiError(401, 'Authentication required');
      }

      const rating = await ratingService.getRating(bookId, patronId);

      res.json(ApiResponse.success(rating));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a rating
   */
  // eslint-disable-next-line class-methods-use-this
  async deleteRating(req, res, next) {
    try {
      const { bookId } = req.params;
      const patronId = req.patron && req.patron.id;

      if (!patronId) {
        throw new ApiError(401, 'Authentication required');
      }

      const result = await ratingService.deleteRating(bookId, patronId, patronId);

      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top-rated books
   */
  // eslint-disable-next-line class-methods-use-this
  async getTopRatedBooks(req, res, next) {
    try {
      const { limit = 20, offset = 0, minRating = null, sortBy = 'average_rating' } = req.query;

      const result = await ratingStatsService.getBooksWithRatings({
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        minRating: minRating ? parseFloat(minRating) : null,
        sortBy,
      });

      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all ratings for a patron (admin only)
   */
  // eslint-disable-next-line class-methods-use-this
  async getPatronRatings(req, res, next) {
    try {
      const { patronId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const result = await ratingService.getPatronRatings(patronId, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RatingController();
