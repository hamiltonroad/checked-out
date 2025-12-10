const Joi = require('joi');

/**
 * Checkout Validator - Joi schemas for checkout endpoints
 */
const checkoutValidator = {
  create: {
    body: Joi.object({
      copyId: Joi.number().integer().required(),
      patronId: Joi.number().integer().required(),
    }),
  },
};

module.exports = checkoutValidator;
