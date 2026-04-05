const Joi = require('joi');

/**
 * Author Validator - Joi schemas for author endpoints
 */
const authorValidator = {
  getAll: {
    query: Joi.object({}),
  },
};

module.exports = authorValidator;
