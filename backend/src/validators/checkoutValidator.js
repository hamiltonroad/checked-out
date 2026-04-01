const Joi = require('joi');

const checkoutValidator = {
  create: {
    body: Joi.object({
      patron_id: Joi.number().integer().positive().required(),
      copy_id: Joi.number().integer().positive().required(),
    }),
  },
};

module.exports = checkoutValidator;
