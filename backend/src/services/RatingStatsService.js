const { Rating, Book, sequelize } = require('../models');

class RatingStatsService {
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
      attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('rating')), 'count']],
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
      average_rating: parseFloat((stats && stats.average_rating) || 0).toFixed(1),
      total_ratings: parseInt((stats && stats.total_ratings) || 0, 10),
      distribution: distributionMap,
    };
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
        ? sequelize.where(
            sequelize.literal(`(SELECT AVG(rating) FROM ratings WHERE ratings.book_id = Book.id)`),
            '>=',
            parseFloat(minRating)
          )
        : undefined,
      order:
        sortBy === 'average_rating'
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

module.exports = new RatingStatsService();
