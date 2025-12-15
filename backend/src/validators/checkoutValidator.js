const Joi = require('joi');

/**
 * Checkout Validator - Joi schemas for checkout endpoints
 */
const checkoutValidator = {
  create: {
    body: Joi.object({
      copy_id: Joi.number().integer().required(),
      patron_id: Joi.number().integer().required(),
      checkout_date: Joi.date().iso().optional(),
      due_date: Joi.date().iso().optional(),
    }),
  },
};

module.exports = checkoutValidator;
