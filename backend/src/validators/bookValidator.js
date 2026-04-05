const Joi = require('joi');

/**
 * Book Validator - Joi schemas for book endpoints
 */
const bookValidator = {
  getAll: {
    query: Joi.object({
      search: Joi.string().max(255).allow('').optional(),
      genre: Joi.string().max(500).optional(),
      profanity: Joi.string().valid('true', 'false').optional(),
      minRating: Joi.number().integer().min(1).max(5).optional(),
      authorId: Joi.string().max(500).optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },
  getById: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
  },
};

module.exports = bookValidator;
