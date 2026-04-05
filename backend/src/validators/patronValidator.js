const Joi = require('joi');

/**
 * Patron Validator - Joi schemas for patron endpoints
 */
const patronValidator = {
  getAll: {
    query: Joi.object({
      status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    }),
  },
  getById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },
  search: {
    query: Joi.object({
      q: Joi.string().min(2).max(100).required(),
      limit: Joi.number().integer().min(1).max(10).default(10),
    }),
  },
  recent: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(5).default(5),
    }),
  },
};

module.exports = patronValidator;
