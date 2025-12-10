const Joi = require('joi');

/**
 * Checkout Validator - Joi schemas for checkout endpoints
 */
const checkoutValidator = {
  create: {
    body: Joi.object({
      patron_id: Joi.number().integer().required(),
      copy_id: Joi.number().integer().required(),
    }),
  },
};

module.exports = checkoutValidator;
