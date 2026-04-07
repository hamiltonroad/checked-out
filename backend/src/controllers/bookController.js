const bookService = require('../services/bookService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Book Controller - HTTP handlers for book endpoints
 */
class BookController {
  /**
   * Get all books with authors, supporting search, filtering, and pagination
   * Query Parameters:
   * - search: Search by book title
   * - genre: Filter by genre (comma-separated for multiple)
   * - minRating: Minimum average rating (1-5)
   * - authorId: Filter by author ID(s) (comma-separated)
   * - profanity: Filter by profanity status (true/false)
   * - format: Filter by copy format (comma-separated, e.g. "physical,kindle")
   * - page: Page number (default 1)
   * - limit: Maximum number of results per page (default 20)
   * - offset: Number of records to skip (overrides page-based offset)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async getAllBooks(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        genre: req.query.genre,
        profanity: req.query.profanity,
        format: req.query.format,
        minRating: req.query.minRating,
        authorId: req.query.authorId,
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
