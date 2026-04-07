const Joi = require('joi');
const {
  DEFAULT_CHECKOUTABLE_LIMIT,
  MAX_CHECKOUTABLE_LIMIT,
} = require('../constants/copyConstants');

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
      limit: Joi.number()
        .integer()
        .min(1)
        .max(MAX_CHECKOUTABLE_LIMIT)
        .default(DEFAULT_CHECKOUTABLE_LIMIT),
    }),
  },
};

module.exports = copyValidator;
