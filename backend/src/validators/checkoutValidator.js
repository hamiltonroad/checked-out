const Joi = require('joi');

/**
 * Checkout Validator - Joi schemas for checkout endpoints
 */
const checkoutValidator = {
  create: {
    body: Joi.object({
      patronId: Joi.number().integer().positive().required(),
      copyId: Joi.number().integer().positive().required(),
    }),
  },
};

module.exports = checkoutValidator;
