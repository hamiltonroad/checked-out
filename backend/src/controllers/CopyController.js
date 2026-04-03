const copyService = require('../services/CopyService');
const ApiResponse = require('../utils/ApiResponse');

class CopyController {
  /**
   * Get available copies for a book
   * GET /api/v1/copies/book/:bookId/available
   */
  // eslint-disable-next-line class-methods-use-this
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
}

module.exports = new CopyController();
