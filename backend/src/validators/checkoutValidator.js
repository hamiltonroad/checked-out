const Joi = require('joi');

const checkoutValidator = {
  create: {
    body: Joi.object({
      patron_id: Joi.number().integer().positive().required(),
      copy_id: Joi.number().integer().positive().required(),
    }),
  },
  return: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },
  getByPatron: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    query: Joi.object({
      status: Joi.string().valid('current', 'returned').optional(),
    }),
  },
};

module.exports = checkoutValidator;
