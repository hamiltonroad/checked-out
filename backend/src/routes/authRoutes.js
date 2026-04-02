const express = require('express');
const authController = require('../controllers/AuthController');
const validateRequest = require('../middlewares/validateRequest');
const authValidator = require('../validators/authValidator');
const { authenticate } = require('../middlewares/auth');
const { strictLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * Auth Routes
 * Base path: /api/v1/auth
 */

// POST /api/v1/auth/login — authenticate and set cookies
router.post('/login', strictLimiter, validateRequest(authValidator.login), authController.login);

// POST /api/v1/auth/logout — clear auth cookies
router.post('/logout', authController.logout);

// POST /api/v1/auth/refresh — rotate access + refresh tokens
router.post('/refresh', strictLimiter, authController.refresh);

// GET /api/v1/auth/me — return current authenticated patron
router.get('/me', authenticate, authController.me);

module.exports = router;
