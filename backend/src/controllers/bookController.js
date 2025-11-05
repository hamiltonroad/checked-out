const bookService = require('../services/bookService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Book Controller - HTTP handlers for book endpoints
 */
class BookController {
  /**
   * Get all books with authors
   * Query Parameters:
   * - genre: Filter by genre
   * - limit: Maximum number of results
   * - offset: Number of records to skip
   * - profanity: Filter by profanity status (true/false)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllBooks(req, res, next) {
    try {
      const filters = {
        genre: req.query.genre,
        limit: req.query.limit,
        offset: req.query.offset,
        profanity: req.query.profanity,
      };
      const result = await bookService.getAllBooks(filters);
      res.json(ApiResponse.success(result, 'Books retrieved successfully'));
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
