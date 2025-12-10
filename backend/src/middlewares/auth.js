const ApiError = require('../utils/ApiError');
const { Patron } = require('../models');

/**
 * Simple authentication middleware
 * In production, this would verify JWT tokens or session cookies
 * For now, we'll use a header-based patron ID for development
 */
const authenticate = async (req, res, next) => {
  try {
    // In production, extract patron from JWT token
    // For development, use X-Patron-Id header
    const patronId = req.headers['x-patron-id'];

    if (!patronId) {
      throw new ApiError(401, 'Authentication required');
    }

    // Verify patron exists and is active
    const patron = await Patron.findOne({
      where: {
        id: patronId,
        status: 'active',
      },
    });

    if (!patron) {
      throw new ApiError(401, 'Invalid or inactive patron');
    }

    // Attach patron to request
    req.patron = patron;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no auth provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const patronId = req.headers['x-patron-id'];

    if (patronId) {
      const patron = await Patron.findOne({
        where: {
          id: patronId,
          status: 'active',
        },
      });

      if (patron) {
        req.patron = patron;
      }
    }

    next();
  } catch (error) {
    // Don't fail on auth errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
