const { Book, Author, Copy, Checkout } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Book Service - Business logic for book operations
 */
class BookService {
  /**
   * Calculate book availability status based on copies and checkouts
   *
   * A book is considered "available" if:
   * - It has no copies (edge case - shows as available)
   * - At least one copy has no checkouts
   * - At least one copy has only returned checkouts (return_date is not null)
   *
   * A book is considered "checked_out" if:
   * - ALL copies have at least one unreturned checkout (return_date is null)
   *
   * @param {Array<Object>} copies - Array of copy objects with nested checkouts
   * @param {Array<Object>} copies[].checkouts - Array of checkout records for each copy
   * @param {Date|null} copies[].checkouts[].return_date - Return date (null if not returned)
   * @returns {string} 'available' or 'checked_out'
   */
  // eslint-disable-next-line class-methods-use-this
  calculateBookStatus(copies) {
    try {
      // Handle edge cases
      if (!copies || !Array.isArray(copies) || copies.length === 0) {
        return 'available'; // No copies = available (edge case)
      }

      // Check if any copy is available
      const hasAvailableCopy = copies.some((copy) => {
        // Validate copy object structure
        if (!copy || typeof copy !== 'object') {
          return false;
        }

        // If copy has no checkouts, it's available
        if (!copy.checkouts || !Array.isArray(copy.checkouts) || copy.checkouts.length === 0) {
          return true;
        }

        // If all checkouts have return dates, copy is available
        return copy.checkouts.every((checkout) => {
          if (!checkout || typeof checkout !== 'object') {
            return false;
          }
          return checkout.return_date !== null;
        });
      });

      return hasAvailableCopy ? 'available' : 'checked_out';
    } catch (error) {
      // Log error and return safe default
      console.error('Error calculating book status:', error);
      return 'available'; // Fail open - show as available if error
    }
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
