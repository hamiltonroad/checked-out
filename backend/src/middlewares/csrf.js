const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const CSRF_COOKIE_NAME = '_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const TOKEN_BYTES = 32;

/**
 * Generate a cryptographically random CSRF token
 * @returns {string} Hex-encoded token
 */
const generateCsrfToken = () => crypto.randomBytes(TOKEN_BYTES).toString('hex');

/**
 * Middleware: set a CSRF cookie on every response if one is not already present.
 * The client reads this cookie and sends it back in the X-CSRF-Token header.
 */
const setCsrfCookie = (req, res, next) => {
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();

    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Client JS must read this value
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  next();
};

/**
 * Middleware: validate CSRF token on state-changing requests.
 * Compares the X-CSRF-Token header against the _csrf cookie (double-submit pattern).
 */
const verifyCsrf = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken) {
    throw ApiError.forbidden('CSRF token missing');
  }

  if (cookieToken !== headerToken) {
    throw ApiError.forbidden('CSRF token mismatch');
  }

  return next();
};

module.exports = { setCsrfCookie, verifyCsrf };
