const { Rating, Book, Patron, sequelize } = require('../models');
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

    // Calculate statistics
    const stats = await this.getBookRatingStats(bookId);

    return {
      ratings,
      stats,
      pagination: {
        limit,
        offset,
        total: stats.total_ratings,
      },
    };
  }

  /**
   * Get rating statistics for a book
   */
  async getBookRatingStats(bookId) {
    const stats = await Rating.findOne({
      where: { book_id: bookId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_ratings'],
      ],
      raw: true,
    });

    // Get distribution
    const distribution = await Rating.findAll({
      where: { book_id: bookId },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('rating')), 'count'],
      ],
      group: ['rating'],
      raw: true,
    });

    // Format distribution as object
    const distributionMap = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    distribution.forEach((item) => {
      distributionMap[item.rating] = parseInt(item.count, 10);
    });

    return {
      average_rating: parseFloat(stats?.average_rating || 0).toFixed(1),
      total_ratings: parseInt(stats?.total_ratings || 0, 10),
      distribution: distributionMap,
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

  /**
   * Get books with their average ratings
   */
  async getBooksWithRatings(options = {}) {
    const { limit = 20, offset = 0, minRating = null, sortBy = 'average_rating' } = options;

    const books = await Book.findAll({
      attributes: [
        'id',
        'title',
        'isbn',
        'genre',
        'publication_year',
        [
          sequelize.literal(`(
            SELECT AVG(rating)
            FROM ratings
            WHERE ratings.book_id = Book.id
          )`),
          'average_rating',
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM ratings
            WHERE ratings.book_id = Book.id
          )`),
          'total_ratings',
        ],
      ],
      include: [
        {
          association: 'authors',
          attributes: ['id', 'first_name', 'last_name'],
          through: { attributes: [] },
        },
      ],
      having: minRating
        ? sequelize.literal(`average_rating >= ${minRating}`)
        : undefined,
      order: sortBy === 'average_rating'
        ? [[sequelize.literal('average_rating'), 'DESC NULLS LAST']]
        : sortBy === 'total_ratings'
        ? [[sequelize.literal('total_ratings'), 'DESC']]
        : [['title', 'ASC']],
      limit,
      offset,
      subQuery: false,
    });

    // Format the results
    const formattedBooks = books.map((book) => {
      const bookData = book.toJSON();
      return {
        ...bookData,
        average_rating: bookData.average_rating
          ? parseFloat(bookData.average_rating).toFixed(1)
          : null,
        total_ratings: parseInt(bookData.total_ratings || 0, 10),
      };
    });

    return {
      books: formattedBooks,
      pagination: {
        limit,
        offset,
      },
    };
  }
}

module.exports = new RatingService();