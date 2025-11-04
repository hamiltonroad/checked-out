const { Book, Author } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Book Service - Business logic for book operations
 */
class BookService {
  /**
   * Get all books with their authors
   * @param {Object} filters - Query filters (genre, limit, offset)
   * @returns {Promise<Array>} List of books with authors
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllBooks(filters = {}) {
    const { genre, limit = 100, offset = 0 } = filters;
    const where = {};

    if (genre) {
      where.genre = genre;
    }

    return Book.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [
        {
          model: Author,
          as: 'authors',
          through: { attributes: [] },
        },
      ],
      order: [['title', 'ASC']],
    });
  }

  /**
   * Get a single book by ID with its authors
   * @param {number} id - Book ID
   * @returns {Promise<Object>} Book with authors
   * @throws {ApiError} 404 if book not found
   */
  // eslint-disable-next-line class-methods-use-this
  async getBookById(id) {
    const book = await Book.findByPk(id, {
      include: [
        {
          model: Author,
          as: 'authors',
          through: { attributes: [] },
        },
      ],
    });

    if (!book) {
      throw ApiError.notFound(`Book with ID ${id} not found`);
    }

    return book;
  }
}

module.exports = new BookService();
