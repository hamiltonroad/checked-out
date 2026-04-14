const ApiError = require('../utils/ApiError');
const { hasMinimumRole } = require('../config/roles');

/**
 * Factory function that returns middleware allowing access if the
 * authenticated patron owns the resource OR has at least the given role.
 * Ownership is determined by comparing `req.patron.id` to `req.params[paramName]`.
 * Must be chained AFTER `authenticate` middleware (per ADR-021).
 *
 * @param {string} minimumRole - The minimum role that bypasses the ownership check
 * @param {string} [paramName='id'] - The route param holding the resource-owner patron ID
 * @returns {import('express').RequestHandler} Express middleware
 */
const requireOwnerOrRole =
  (minimumRole, paramName = 'id') =>
  (req, _res, next) => {
    if (!req.patron) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const resourceOwnerId = parseInt(req.params[paramName], 10);

    if (req.patron.id !== resourceOwnerId && !hasMinimumRole(req.patron.role, minimumRole)) {
      return next(ApiError.forbidden('You can only access your own resources'));
    }

    next();
  };

module.exports = requireOwnerOrRole;
