const holdService = require('../services/HoldService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { hasMinimumRole, ROLES } = require('../config/roles');

class HoldController {
  /** Get active holds for a patron (patron can only access their own) */
  async getPatronHolds(req, res, next) {
    try {
      const { id } = req.params;
      const patronId = req.patron.id;

      if (patronId !== parseInt(id, 10) && !hasMinimumRole(req.patron.role, ROLES.LIBRARIAN)) {
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
