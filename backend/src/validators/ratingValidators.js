const Joi = require('joi');

/**
 * Rating Validator - Joi schemas for rating endpoints
 */
const ratingValidator = {
  create: {
    body: Joi.object({
      bookId: Joi.number().integer().positive().required(),
      rating: Joi.number().integer().min(1).max(5).required(),
      reviewText: Joi.string().max(2000).allow('', null).optional(),
    }),
  },
};

module.exports = ratingValidator;
