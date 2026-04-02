const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Rate Limit Tier Configurations
 *
 * STANDARD_TIER: For read-only (GET) endpoints — generous limit.
 * STRICT_TIER:   For write (POST/PUT/DELETE) and auth endpoints — low limit.
 */
const STANDARD_TIER = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
};

const STRICT_TIER = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
};

/**
 * Creates an express-rate-limit middleware instance for the given tier.
 *
 * @param {object} tierConfig - Tier configuration with windowMs and max.
 * @param {number} tierConfig.windowMs - Time window in milliseconds.
 * @param {number} tierConfig.max - Maximum requests per window per IP.
 * @returns {Function} Express middleware.
 */
const createRateLimiter = (tierConfig) =>
  rateLimit({
    windowMs: tierConfig.windowMs,
    max: tierConfig.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded: %s %s from %s', req.method, req.originalUrl, req.ip);
      res
        .status(429)
        .json(ApiResponse.error('Too many requests from this IP, please try again later.', 429));
    },
  });

const standardLimiter = createRateLimiter(STANDARD_TIER);
const strictLimiter = createRateLimiter(STRICT_TIER);

module.exports = {
  createRateLimiter,
  standardLimiter,
  strictLimiter,
  STANDARD_TIER,
  STRICT_TIER,
};
