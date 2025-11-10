const Joi = require('joi');

/**
 * Review Validator - Joi schemas for review endpoints
 */
const reviewValidator = {
  createReview: {
    params: Joi.object({
      bookId: Joi.number().integer().required(),
    }),
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      reviewText: Joi.string().max(1000).allow('', null).optional(),
      patronId: Joi.number().integer().required(), // Temporary until authentication is implemented
    }),
  },
  updateReview: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      reviewText: Joi.string().max(1000).allow('', null).optional(),
      patronId: Joi.number().integer().required(), // Temporary until authentication is implemented
    }),
  },
  deleteReview: {
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    query: Joi.object({
      patronId: Joi.number().integer().required(), // Temporary until authentication is implemented
    }),
  },
  getReviewsByBook: {
    params: Joi.object({
      bookId: Joi.number().integer().required(),
    }),
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(10).optional(),
      offset: Joi.number().integer().min(0).default(0).optional(),
    }),
  },
};

module.exports = reviewValidator;
