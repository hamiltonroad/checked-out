const authService = require('../services/AuthService');
const ApiResponse = require('../utils/ApiResponse');

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

/**
 * Cookie options shared by access and refresh tokens
 */
const baseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
});

/**
 * Set both access and refresh token cookies on the response
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions(),
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth', // Only sent to auth endpoints
  });
};

/**
 * Clear both token cookies
 */
const clearTokenCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
};

class AuthController {
  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { card_number: cardNumber, password } = req.body;

      const { patron, accessToken, refreshToken } = await authService.login(cardNumber, password);

      setTokenCookies(res, accessToken, refreshToken);

      res.status(200).json(ApiResponse.success(patron, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res) {
    clearTokenCookies(res);
    res.status(200).json(ApiResponse.success(null, 'Logout successful'));
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const token = req.cookies[REFRESH_COOKIE];

      if (!token) {
        return res.status(401).json(ApiResponse.error('No refresh token provided', 401));
      }

      const { patron, accessToken, refreshToken } = await authService.refresh(token);

      setTokenCookies(res, accessToken, refreshToken);

      return res.status(200).json(ApiResponse.success(patron, 'Token refreshed'));
    } catch (error) {
      clearTokenCookies(res);
      return next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(req, res) {
    res.status(200).json(ApiResponse.success(req.patron, 'Patron retrieved'));
  }
}

module.exports = new AuthController();
