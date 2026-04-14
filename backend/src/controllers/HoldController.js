const holdService = require('../services/HoldService');
const ApiResponse = require('../utils/ApiResponse');

class HoldController {
  /** Get active holds for a patron (ownership enforced by requireOwnerOrRole middleware) */
  async getPatronHolds(req, res, next) {
    try {
      const { id } = req.params;

      const holds = await holdService.getPatronHolds(parseInt(id, 10));

      res.json(ApiResponse.success(holds, 'Patron holds retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HoldController();
