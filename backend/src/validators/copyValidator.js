const Joi = require('joi');

const copyValidator = {
  getAvailableByBook: {
    params: Joi.object({
      bookId: Joi.number().integer().positive().required(),
    }),
  },
};

module.exports = copyValidator;
