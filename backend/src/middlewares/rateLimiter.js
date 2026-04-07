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

/**
 * TEST_MODE: when set to the string 'true', both exported limiters are
 * replaced at module-load time with a shared no-op middleware. This is a
 * factory-level switch (not per-request) so there is zero hot-path branching.
 * MUST only be enabled by local automated test scripts — see CLAUDE.md.
 */
const TEST_MODE = process.env.TEST_MODE === 'true';

const noopLimiter = (req, res, next) => next();

if (TEST_MODE) {
  logger.warn('TEST_MODE active: rate limiting disabled (no-op middleware in place)');
}

const standardLimiter = TEST_MODE ? noopLimiter : createRateLimiter(STANDARD_TIER);
const strictLimiter = TEST_MODE ? noopLimiter : createRateLimiter(STRICT_TIER);

module.exports = {
  createRateLimiter,
  standardLimiter,
  strictLimiter,
  STANDARD_TIER,
  STRICT_TIER,
};
