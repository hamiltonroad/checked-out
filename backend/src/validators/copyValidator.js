const Joi = require('joi');

const copyValidator = {
  getAvailableByBook: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required(),
    }),
  },
  checkoutableQuery: {
    query: Joi.object({
      bookId: Joi.number().integer().positive().optional(),
      format: Joi.string().valid('physical', 'kindle').optional(),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },
};

module.exports = copyValidator;
