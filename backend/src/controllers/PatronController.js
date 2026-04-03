const patronService = require('../services/PatronService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller for patron-related HTTP endpoints
 */
class PatronController {
  /**
   * List patrons, optionally filtered by status
   * GET /api/v1/patrons?status=active
   */
  // eslint-disable-next-line class-methods-use-this
  async listPatrons(req, res, next) {
    try {
      const { status } = req.query;
      const patrons = await patronService.getActivePatrons({ status });

      res.json(ApiResponse.success(patrons, 'Patrons retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PatronController();
