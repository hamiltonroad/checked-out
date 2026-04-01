const logger = require('../config/logger');
const ApiResponse = require('../utils/ApiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  const extras = process.env.NODE_ENV === 'development' ? { stack: err.stack } : {};

  res.status(statusCode).json(ApiResponse.error(message, statusCode, extras));
};

module.exports = errorHandler;
