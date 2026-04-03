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
};

module.exports = patronValidator;
