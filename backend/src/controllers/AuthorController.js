const authorService = require('../services/AuthorService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Author Controller - HTTP handlers for author endpoints
 */
class AuthorController {
  /**
   * Get all authors for autocomplete population
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllAuthors(req, res, next) {
    try {
      const authors = await authorService.getAllAuthors();
      res.json(ApiResponse.success({ authors }, 'Authors retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthorController();
