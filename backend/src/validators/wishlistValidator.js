const Joi = require('joi');

/**
 * Wishlist Validator - Joi schemas for wishlist endpoints
 */
const wishlistValidator = {
  add: {
    body: Joi.object({
      book_id: Joi.number().integer().positive().required(),
    }),
  },

  remove: {
    body: Joi.object({
      book_id: Joi.number().integer().positive().required(),
    }),
  },

  getPatronWishlist: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },
};

module.exports = wishlistValidator;
