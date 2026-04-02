const { Op } = require('sequelize');
const { Book, Author, Copy, Checkout, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Shared rating subquery attributes for book queries */
const RATING_ATTRIBUTES = [
  [
    sequelize.literal(`(
      SELECT AVG(rating) FROM ratings WHERE ratings.book_id = Book.id
    )`),
    'average_rating',
  ],
  [
    sequelize.literal(`(
      SELECT COUNT(*) FROM ratings WHERE ratings.book_id = Book.id
    )`),
    'total_ratings',
  ],
];

/** Shared include config for book associations */
const BOOK_INCLUDES = [
  { model: Author, as: 'authors', through: { attributes: [] } },
  { model: Copy, as: 'copies', include: [{ model: Checkout, as: 'checkouts' }] },
];

/**
 * Book Service - Business logic for book operations
 */
class BookService {
  /**
   * Calculate book availability status based on copies and checkouts
   * @param {Array<Object>} copies - Copy objects with nested checkouts
   * @returns {string} 'available' or 'checked_out'
   */
  // eslint-disable-next-line class-methods-use-this
  calculateBookStatus(copies) {
    try {
      if (!copies || !Array.isArray(copies) || copies.length === 0) {
        return 'available';
      }

      const hasAvailableCopy = copies.some((copy) => {
        if (!copy || typeof copy !== 'object') return false;
        if (!copy.checkouts || !Array.isArray(copy.checkouts) || copy.checkouts.length === 0) {
          return true;
        }
        return copy.checkouts.every(
          (co) => co && typeof co === 'object' && co.return_date !== null
        );
      });

      return hasAvailableCopy ? 'available' : 'checked_out';
    } catch (error) {
      logger.error('Error calculating book status:', error);
      return 'available';
    }
  }

  /**
   * Format a raw book record into the API response shape
   * @param {Object} book - Sequelize book instance
   * @returns {Object} Formatted book with status and rating fields
   */
  formatBook(book) {
    const bookData = book.toJSON ? book.toJSON() : book;
    bookData.status = this.calculateBookStatus(bookData.copies);
    bookData.average_rating = bookData.average_rating
      ? parseFloat(bookData.average_rating).toFixed(1)
      : null;
    bookData.total_ratings = parseInt(bookData.total_ratings || 0, 10);
    return bookData;
  }

  /**
   * Escape LIKE wildcard characters in a search string
   * @param {string} str - Raw search string
   * @returns {string} Escaped string safe for LIKE patterns
   */
  // eslint-disable-next-line class-methods-use-this
  escapeLikeWildcards(str) {
    return str.replace(/[%_]/g, '\\$&');
  }

  /**
   * Build Sequelize where clause from filter params
   * @param {Object} filters - Query filters
   * @returns {{ bookWhere: Object, authorWhere: Object|null }}
   */
  // eslint-disable-next-line class-methods-use-this
  buildWhereClause(filters) {
    const { search, genre, profanity } = filters;
    const bookWhere = {};
    let authorWhere = null;

    if (genre) {
      bookWhere.genre = genre;
    }

    if (profanity !== undefined && profanity !== '') {
      bookWhere.has_profanity = profanity === 'true' || profanity === true;
    }

    if (search) {
      const escaped = this.escapeLikeWildcards(search);
      authorWhere = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${escaped}%` } },
          { last_name: { [Op.like]: `%${escaped}%` } },
        ],
      };
    }

    return { bookWhere, authorWhere };
  }

  /**
   * Get all books with filtering, search, and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} { books, pagination }
   */
  async getAllBooks(filters = {}) {
    const page = Math.max(parseInt(filters.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.min(parseInt(filters.limit, 10) || DEFAULT_LIMIT, MAX_LIMIT);
    const offset = filters.offset !== undefined ? parseInt(filters.offset, 10) : (page - 1) * limit;
    const { bookWhere, authorWhere } = this.buildWhereClause(filters);

    // When searching, find matching book IDs first (title OR author match)
    let bookIdFilter = null;
    if (filters.search) {
      const escaped = this.escapeLikeWildcards(filters.search);

      const titleMatches = await Book.findAll({
        where: { title: { [Op.like]: `%${escaped}%` } },
        attributes: ['id'],
        raw: true,
      });

      const authorMatches = await Author.findAll({
        where: authorWhere,
        attributes: [],
        include: [{ model: Book, as: 'books', attributes: ['id'], through: { attributes: [] } }],
      });

      const authorBookIds = authorMatches.flatMap((a) => a.books.map((b) => b.id));
      const titleBookIds = titleMatches.map((b) => b.id);
      const allMatchIds = [...new Set([...titleBookIds, ...authorBookIds])];

      bookIdFilter = { id: { [Op.in]: allMatchIds } };
    }

    const where = { ...bookWhere, ...bookIdFilter };

    const { count: total, rows: books } = await Book.findAndCountAll({
      where,
      limit,
      offset,
      attributes: { include: RATING_ATTRIBUTES },
      include: BOOK_INCLUDES,
      order: [['title', 'ASC']],
      distinct: true,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      books: books.map((book) => this.formatBook(book)),
      pagination: { page, limit, total, totalPages },
    };
  }

  /**
   * Get a single book by ID with its authors
   * @param {number} id - Book ID
   * @returns {Promise<Object>} Book with authors and status
   * @throws {ApiError} 404 if book not found
   */
  async getBookById(id) {
    const book = await Book.findByPk(id, {
      attributes: { include: RATING_ATTRIBUTES },
      include: BOOK_INCLUDES,
    });

    if (!book) {
      throw ApiError.notFound(`Book with ID ${id} not found`);
    }

    return this.formatBook(book);
  }
}

module.exports = new BookService();
