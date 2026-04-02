const ApiError = require('../utils/ApiError');
const { Patron } = require('../models');
const authService = require('../services/AuthService');
const logger = require('../config/logger');

const ACCESS_COOKIE = 'access_token';
const DEV_HEADER = 'x-patron-id';

/**
 * Try to authenticate via JWT cookie.
 * @returns {Object|null} Patron instance or null
 */
const authenticateViaCookie = async (req) => {
  const token = req.cookies && req.cookies[ACCESS_COOKIE];

  if (!token) {
    return null;
  }

  const payload = authService.verifyAccessToken(token);

  const patron = await Patron.findOne({
    where: { id: payload.sub, status: 'active' },
  });

  return patron;
};

/**
 * Fallback: authenticate via X-Patron-Id header (development only).
 * @returns {Object|null} Patron instance or null
 */
const authenticateViaHeader = async (req) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const patronId = req.headers[DEV_HEADER];

  if (!patronId) {
    return null;
  }

  logger.debug('Dev-mode header auth used', { patronId });

  const patron = await Patron.findOne({
    where: { id: patronId, status: 'active' },
  });

  return patron;
};

/**
 * Authentication middleware — requires a valid patron.
 * Checks JWT cookie first, then falls back to X-Patron-Id in dev mode.
 */
const authenticate = async (req, res, next) => {
  try {
    let patron = await authenticateViaCookie(req);

    if (!patron) {
      patron = await authenticateViaHeader(req);
    }

    if (!patron) {
      throw new ApiError(401, 'Authentication required');
    }

    req.patron = patron;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(401, 'Authentication required'));
  }
};

/**
 * Optional authentication — attaches patron if credentials are present
 * but does not fail if absent.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let patron = await authenticateViaCookie(req);

    if (!patron) {
      patron = await authenticateViaHeader(req);
    }

    if (patron) {
      req.patron = patron;
    }

    next();
  } catch (error) {
    // Swallow auth errors for optional auth
    next();
  }
};

module.exports = { authenticate, optionalAuth };
