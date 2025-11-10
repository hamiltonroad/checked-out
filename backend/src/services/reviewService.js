const { Review, Patron, Book, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Review Service - Business logic for review operations
 */
class ReviewService {
  /**
   * Create a new review for a book
   * @param {number} bookId - ID of the book
   * @param {number} patronId - ID of the patron
   * @param {number} rating - Rating (1-5)
   * @param {string} reviewText - Optional review text
   * @returns {Promise<Object>} Created review with patron info
   */
  // eslint-disable-next-line class-methods-use-this
  async createReview(bookId, patronId, rating, reviewText) {
    // Verify book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw ApiError.notFound(`Book with ID ${bookId} not found`);
    }

    // Verify patron exists
    const patron = await Patron.findByPk(patronId);
    if (!patron) {
      throw ApiError.notFound(`Patron with ID ${patronId} not found`);
    }

    // Check for existing review (unique constraint)
    const existingReview = await Review.findOne({
      where: { book_id: bookId, patron_id: patronId },
    });
    if (existingReview) {
      throw ApiError.conflict('You have already reviewed this book');
    }

    // Create the review
    const review = await Review.create({
      book_id: bookId,
      patron_id: patronId,
      rating,
      review_text: reviewText || null,
    });

    // Fetch with patron info
    const reviewWithPatron = await Review.findByPk(review.id, {
      include: [
        {
          model: Patron,
          as: 'patron',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    return reviewWithPatron;
  }

  /**
   * Update an existing review
   * @param {number} reviewId - ID of the review
   * @param {number} patronId - ID of the patron (for ownership verification)
   * @param {number} rating - New rating
   * @param {string} reviewText - New review text
   * @returns {Promise<Object>} Updated review
   */
  // eslint-disable-next-line class-methods-use-this
  async updateReview(reviewId, patronId, rating, reviewText) {
    // Find the review
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw ApiError.notFound(`Review with ID ${reviewId} not found`);
    }

    // Verify ownership
    if (review.patron_id !== patronId) {
      throw ApiError.forbidden('You can only edit your own reviews');
    }

    // Update the review
    await review.update({
      rating,
      review_text: reviewText || null,
    });

    // Fetch with patron info
    const reviewWithPatron = await Review.findByPk(review.id, {
      include: [
        {
          model: Patron,
          as: 'patron',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    return reviewWithPatron;
  }

  /**
   * Delete a review
   * @param {number} reviewId - ID of the review
   * @param {number} patronId - ID of the patron (for ownership verification)
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async deleteReview(reviewId, patronId) {
    // Find the review
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw ApiError.notFound(`Review with ID ${reviewId} not found`);
    }

    // Verify ownership
    if (review.patron_id !== patronId) {
      throw ApiError.forbidden('You can only delete your own reviews');
    }

    // Delete the review
    await review.destroy();
  }

  /**
   * Get all reviews for a book with pagination
   * @param {number} bookId - ID of the book
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Number of reviews to return
   * @param {number} options.offset - Number of reviews to skip
   * @returns {Promise<Object>} Reviews with patron info and pagination metadata
   */
  // eslint-disable-next-line class-methods-use-this
  async getReviewsByBook(bookId, { limit = 10, offset = 0 } = {}) {
    // Verify book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw ApiError.notFound(`Book with ID ${bookId} not found`);
    }

    // Fetch reviews with patron info
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { book_id: bookId },
      include: [
        {
          model: Patron,
          as: 'patron',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    return {
      reviews,
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    };
  }

  /**
   * Calculate average rating and review count for a book
   * @param {number} bookId - ID of the book
   * @returns {Promise<Object>} Average rating and count
   */
  // eslint-disable-next-line class-methods-use-this
  async calculateAverageRating(bookId) {
    const result = await Review.findOne({
      where: { book_id: bookId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount'],
      ],
      raw: true,
    });

    return {
      averageRating: result.averageRating ? parseFloat(result.averageRating) : 0,
      reviewCount: parseInt(result.reviewCount, 10) || 0,
    };
  }

  /**
   * Calculate average ratings for multiple books (efficient batch operation)
   * @param {Array<number>} bookIds - Array of book IDs
   * @returns {Promise<Object>} Map of bookId to rating stats
   */
  // eslint-disable-next-line class-methods-use-this
  async calculateAverageRatingsForBooks(bookIds) {
    if (!bookIds || bookIds.length === 0) {
      return {};
    }

    const results = await Review.findAll({
      where: { book_id: bookIds },
      attributes: [
        'book_id',
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount'],
      ],
      group: ['book_id'],
      raw: true,
    });

    // Convert to map for easy lookup
    const ratingsMap = {};
    results.forEach((result) => {
      ratingsMap[result.book_id] = {
        averageRating: result.averageRating ? parseFloat(result.averageRating) : 0,
        reviewCount: parseInt(result.reviewCount, 10) || 0,
      };
    });

    // Fill in missing books with zeros
    bookIds.forEach((bookId) => {
      if (!ratingsMap[bookId]) {
        ratingsMap[bookId] = {
          averageRating: 0,
          reviewCount: 0,
        };
      }
    });

    return ratingsMap;
  }
}

module.exports = new ReviewService();
