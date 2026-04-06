const ApiError = require('../utils/ApiError');
const { hasMinimumRole } = require('../config/roles');

/**
 * Factory function that returns middleware enforcing a minimum role level.
 * Must be chained AFTER `authenticate` middleware (per ADR-021).
 *
 * @param {string} minimumRole - The minimum role required (patron, librarian, admin)
 * @returns {import('express').RequestHandler} Express middleware
 */
const requireRole = (minimumRole) => {
  return (req, _res, next) => {
    if (!req.patron) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!hasMinimumRole(req.patron.role, minimumRole)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

module.exports = requireRole;
