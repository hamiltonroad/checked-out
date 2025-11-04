const Joi = require('joi');

/**
 * Book Validator - Joi schemas for book endpoints
 */
const bookValidator = {
  getAll: {
    query: Joi.object({
      genre: Joi.string().max(100).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },
};

module.exports = bookValidator;
