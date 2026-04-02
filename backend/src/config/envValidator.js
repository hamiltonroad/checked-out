const Joi = require('joi');
const logger = require('./logger');

/**
 * Joi schema for environment variable validation.
 *
 * Validates all required and optional env vars at startup.
 * Uses allowUnknown so system-level env vars are not rejected.
 */
const envSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  // Database (all required for any environment)
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).default(3306),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').default(''),

  // Authentication
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().optional(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // CORS
  CORS_ORIGIN: Joi.string().optional(),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .optional(),

  // Profanity filter
  PROFANITY_WORDS_CUSTOM: Joi.string().optional(),
}).unknown(true);

/**
 * Validate process.env against the schema.
 *
 * On failure, logs every validation error and exits with code 1.
 * On success, returns the validated (with defaults applied) values.
 *
 * @returns {object} Validated environment values with defaults applied
 */
function validateEnv() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
  });

  if (error) {
    logger.error('Environment validation failed. Fix the following issues:');

    error.details.forEach((detail) => {
      logger.error(`  - ${detail.message}`);
    });

    process.exit(1);
  }

  return value;
}

module.exports = { validateEnv, envSchema };
