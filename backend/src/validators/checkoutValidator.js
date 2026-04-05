const Joi = require('joi');

const checkoutValidator = {
  create: {
    body: Joi.object({
      copy_id: Joi.number().integer().positive().required(),
    }),
  },
  return: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      returnDate: Joi.date().iso().optional(),
    }).optional(),
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
