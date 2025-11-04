const bookService = require('../services/bookService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Book Controller - HTTP handlers for book endpoints
 */
class BookController {
  /**
   * Get all books with authors
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllBooks(req, res, next) {
    try {
      const result = await bookService.getAllBooks();
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();
