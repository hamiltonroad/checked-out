const { Rating, Book, Patron } = require('../models');
const ApiError = require('../utils/ApiError');

class RatingService {
  /**
   * Create or update a rating
   */
  async createOrUpdateRating({ bookId, patronId, rating, reviewText }) {
    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5');
    }

    // Check if book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    // Check if patron exists
    const patron = await Patron.findByPk(patronId);
    if (!patron) {
      throw new ApiError(404, 'Patron not found');
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: {
        book_id: bookId,
        patron_id: patronId,
      },
    });

    if (existingRating) {
      // Update existing rating
      await existingRating.update({
        rating,
        review_text: reviewText,
      });

      return existingRating;
    } else {
      // Create new rating
      const newRating = await Rating.create({
        book_id: bookId,
        patron_id: patronId,
        rating,
        review_text: reviewText,
      });

      return newRating;
    }
  }

  /**
   * Get all ratings for a specific book
   */
  async getBookRatings(bookId, options = {}) {
    const { limit = 10, offset = 0, includeReviews = true } = options;

    const ratings = await Rating.findAll({
      where: { book_id: bookId },
      include: [
        {
          model: Patron,
          as: 'patron',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      attributes: includeReviews
        ? ['id', 'rating', 'review_text', 'created_at', 'updated_at']
        : ['id', 'rating', 'created_at'],
    });

    const totalCount = await Rating.count({ where: { book_id: bookId } });

    return {
      ratings,
      pagination: {
        limit,
        offset,
        total: totalCount,
      },
    };
  }

  /**
   * Get all ratings by a specific patron
   */
  async getPatronRatings(patronId, options = {}) {
    const { limit = 10, offset = 0 } = options;

    const ratings = await Rating.findAndCountAll({
      where: { patron_id: patronId },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'isbn', 'genre'],
          include: [
            {
              association: 'authors',
              attributes: ['id', 'first_name', 'last_name'],
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [['updated_at', 'DESC']],
      limit,
      offset,
    });

    return {
      ratings: ratings.rows,
      pagination: {
        limit,
        offset,
        total: ratings.count,
      },
    };
  }

  /**
   * Get a specific rating
   */
  async getRating(bookId, patronId) {
    const rating = await Rating.findOne({
      where: {
        book_id: bookId,
        patron_id: patronId,
      },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title'],
        },
        {
          model: Patron,
          as: 'patron',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!rating) {
      throw new ApiError(404, 'Rating not found');
    }

    return rating;
  }

  /**
   * Delete a rating
   */
  async deleteRating(bookId, patronId, requestingPatronId) {
    // Check if the requesting patron is the owner of the rating
    if (patronId !== requestingPatronId) {
      throw new ApiError(403, 'You can only delete your own ratings');
    }

    const rating = await Rating.findOne({
      where: {
        book_id: bookId,
        patron_id: patronId,
      },
    });

    if (!rating) {
      throw new ApiError(404, 'Rating not found');
    }

    await rating.destroy();

    return { message: 'Rating deleted successfully' };
  }
}

module.exports = new RatingService();
