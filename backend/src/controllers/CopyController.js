const copyService = require('../services/CopyService');
const ApiResponse = require('../utils/ApiResponse');

class CopyController {
  /**
   * Get available copies for a book
   * GET /api/v1/copies/book/:bookId/available
   */
  async getAvailableCopies(req, res, next) {
    try {
      const bookId = parseInt(req.params.bookId, 10);

      const { available, totalCopies } = await copyService.getAvailableCopiesByBook(bookId);

      const responseData = { copies: available, totalCopies };

      res
        .status(200)
        .json(ApiResponse.success(responseData, 'Available copies retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get checkoutable copies (free + not waitlist-gated)
   * GET /api/v1/copies/checkoutable?bookId&format&limit
   */
  async getCheckoutable(req, res, next) {
    try {
      const { bookId, format, limit } = req.query;
      const result = await copyService.findCheckoutable({
        bookId: bookId !== undefined ? parseInt(bookId, 10) : undefined,
        format,
        limit: limit !== undefined ? parseInt(limit, 10) : undefined,
      });
      res
        .status(200)
        .json(ApiResponse.success(result, 'Checkoutable copies retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CopyController();
