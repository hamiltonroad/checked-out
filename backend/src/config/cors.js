const logger = require('./logger');

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

/**
 * Parse CORS origins from environment variable.
 * Splits on commas and trims whitespace from each entry.
 * Falls back to DEFAULT_ORIGINS when CORS_ORIGINS is not set.
 */
const parseOrigins = () => {
  const envValue = process.env.CORS_ORIGINS;

  if (!envValue) {
    return DEFAULT_ORIGINS;
  }

  const origins = envValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    logger.warn('CORS_ORIGINS is set but empty; using defaults');
    return DEFAULT_ORIGINS;
  }

  return origins;
};

const allowedOrigins = parseOrigins();

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

module.exports = corsOptions;
