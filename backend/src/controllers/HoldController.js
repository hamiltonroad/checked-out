const holdService = require('../services/HoldService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

class HoldController {
  /** Get active holds for a patron (patron can only access their own) */
  async getPatronHolds(req, res, next) {
    try {
      const { id } = req.params;
      const patronId = req.patron.id;

      if (patronId !== parseInt(id, 10)) {
        throw ApiError.forbidden('You can only view your own holds');
      }

      const holds = await holdService.getPatronHolds(parseInt(id, 10));

      res.json(ApiResponse.success(holds, 'Patron holds retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HoldController();
