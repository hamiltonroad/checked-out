const bookService = require('../services/bookService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Book Controller - HTTP handlers for book endpoints
 */
class BookController {
  /**
   * Get all books with authors, supporting search, filtering, and pagination
   * Query Parameters:
   * - search: Search by title or author name
   * - genre: Filter by genre
   * - profanity: Filter by profanity status (true/false)
   * - page: Page number (default 1)
   * - limit: Maximum number of results per page (default 20)
   * - offset: Number of records to skip (overrides page-based offset)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllBooks(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        genre: req.query.genre,
        profanity: req.query.profanity,
        page: req.query.page,
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await bookService.getAllBooks(filters);
      res.json(
        ApiResponse.success(
          { books: result.books, pagination: result.pagination },
          'Books retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single book by ID with authors
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async getBookById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await bookService.getBookById(id);
      res.json(ApiResponse.success(result, 'Book retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();
