const { Book, Author, Copy, Checkout } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Book Service - Business logic for book operations
 */
class BookService {
  /**
   * Calculate book availability status based on copies and checkouts
   * @param {Array} copies - Array of copy objects with checkouts
   * @returns {string} 'available' or 'checked_out'
   */
  // eslint-disable-next-line class-methods-use-this
  calculateBookStatus(copies) {
    if (!copies || copies.length === 0) {
      return 'available'; // No copies = available (edge case)
    }

    const hasAvailableCopy = copies.some((copy) => {
      if (!copy.checkouts || copy.checkouts.length === 0) {
        return true; // Copy has no checkouts
      }
      return copy.checkouts.every((checkout) => checkout.return_date !== null);
    });

    return hasAvailableCopy ? 'available' : 'checked_out';
  }

  /**
   * Get all books with their authors
   * @param {Object} filters - Query filters (genre, limit, offset)
   * @returns {Promise<Array>} List of books with authors and status
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllBooks(filters = {}) {
    const { genre, limit = 100, offset = 0 } = filters;
    const where = {};

    if (genre) {
      where.genre = genre;
    }

    const books = await Book.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [
        {
          model: Author,
          as: 'authors',
          through: { attributes: [] },
        },
        {
          model: Copy,
          as: 'copies',
          include: [
            {
              model: Checkout,
              as: 'checkouts',
            },
          ],
        },
      ],
      order: [['title', 'ASC']],
    });

    return books.map((book) => {
      const bookData = book.toJSON();
      bookData.status = this.calculateBookStatus(bookData.copies);
      return bookData;
    });
  }

  /**
   * Get a single book by ID with its authors
   * @param {number} id - Book ID
   * @returns {Promise<Object>} Book with authors and status
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
        {
          model: Copy,
          as: 'copies',
          include: [
            {
              model: Checkout,
              as: 'checkouts',
            },
          ],
        },
      ],
    });

    if (!book) {
      throw ApiError.notFound(`Book with ID ${id} not found`);
    }

    const bookData = book.toJSON();
    bookData.status = this.calculateBookStatus(bookData.copies);
    return bookData;
  }
}

module.exports = new BookService();
