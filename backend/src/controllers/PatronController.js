const patronService = require('../services/PatronService');
const patronCheckoutService = require('../services/PatronCheckoutService');
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

  /**
   * Search patrons by partial name or card number
   * GET /api/v1/patrons/search?q=xxx&limit=10
   */
  // eslint-disable-next-line class-methods-use-this
  async searchPatrons(req, res, next) {
    try {
      const { q, limit } = req.query;
      const patrons = await patronService.searchPatrons(q, limit);
      res.json(ApiResponse.success(patrons, 'Patron search results'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recently checked-out-to patrons for the authenticated user
   * GET /api/v1/patrons/recent?limit=5
   */
  // eslint-disable-next-line class-methods-use-this
  async getRecentPatrons(req, res, next) {
    try {
      const { limit } = req.query;
      const patrons = await patronCheckoutService.getRecentPatrons(req.patron.id, limit);
      res.json(ApiResponse.success(patrons, 'Recent patrons retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single patron by ID
   * GET /api/v1/patrons/:id
   */
  // eslint-disable-next-line class-methods-use-this
  async getPatronById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const patron = await patronService.getPatronById(id);

      res.json(ApiResponse.success(patron, 'Patron retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PatronController();
