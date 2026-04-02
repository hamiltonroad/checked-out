const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Patron } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const SALT_ROUNDS = 12;

/**
 * Authentication service — JWT token management and credential verification
 */
class AuthService {
  /**
   * Authenticate patron by card number and password
   * @param {string} cardNumber - Library card number
   * @param {string} password - Plain-text password
   * @returns {Object} { patron, accessToken, refreshToken }
   */
  async login(cardNumber, password) {
    const patron = await Patron.scope('withPassword').findOne({
      where: { card_number: cardNumber, status: 'active' },
    });

    if (!patron) {
      throw ApiError.unauthorized('Invalid card number or password');
    }

    if (!patron.password_hash) {
      throw ApiError.unauthorized('Account not set up for password login');
    }

    const valid = await bcrypt.compare(password, patron.password_hash);

    if (!valid) {
      throw ApiError.unauthorized('Invalid card number or password');
    }

    logger.info('Patron logged in', { patronId: patron.id });

    const accessToken = this.generateAccessToken(patron);
    const refreshToken = this.generateRefreshToken(patron);

    return { patron: this.sanitizePatron(patron), accessToken, refreshToken };
  }

  /**
   * Generate a short-lived access token
   * @param {Object} patron - Patron model instance
   * @returns {string} JWT access token
   */
  // eslint-disable-next-line class-methods-use-this
  generateAccessToken(patron) {
    return jwt.sign({ sub: patron.id, cardNumber: patron.card_number }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  }

  /**
   * Generate a long-lived refresh token
   * @param {Object} patron - Patron model instance
   * @returns {string} JWT refresh token
   */
  // eslint-disable-next-line class-methods-use-this
  generateRefreshToken(patron) {
    return jwt.sign(
      { sub: patron.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verify an access token and return its payload
   * @param {string} token - JWT access token
   * @returns {Object} Decoded token payload
   */
  // eslint-disable-next-line class-methods-use-this
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  }

  /**
   * Verify a refresh token and issue new token pair
   * @param {string} token - JWT refresh token
   * @returns {Object} { patron, accessToken, refreshToken }
   */
  async refresh(token) {
    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw ApiError.unauthorized('Invalid token type');
    }

    const patron = await Patron.findOne({
      where: { id: payload.sub, status: 'active' },
    });

    if (!patron) {
      throw ApiError.unauthorized('Patron not found or inactive');
    }

    logger.info('Token refreshed', { patronId: patron.id });

    const accessToken = this.generateAccessToken(patron);
    const refreshToken = this.generateRefreshToken(patron);

    return { patron: this.sanitizePatron(patron), accessToken, refreshToken };
  }

  /**
   * Hash a plain-text password
   * @param {string} password - Plain-text password
   * @returns {string} Bcrypt hash
   */
  // eslint-disable-next-line class-methods-use-this
  async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Strip sensitive fields from patron for API responses
   * @param {Object} patron - Patron model instance
   * @returns {Object} Patron without password_hash
   */
  // eslint-disable-next-line class-methods-use-this
  sanitizePatron(patron) {
    const data = patron.toJSON();
    delete data.password_hash;
    return data;
  }
}

module.exports = new AuthService();
