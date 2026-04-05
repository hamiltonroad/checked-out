const Joi = require('joi');

/**
 * Waitlist Validator - Joi schemas for waitlist endpoints
 */
const waitlistValidator = {
  join: {
    body: Joi.object({
      book_id: Joi.number().integer().positive().required(),
      format: Joi.string().valid('physical', 'kindle').required(),
    }),
  },

  leave: {
    body: Joi.object({
      book_id: Joi.number().integer().positive().required(),
      format: Joi.string().valid('physical', 'kindle').required(),
    }),
  },

  getBookWaitlist: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    query: Joi.object({
      format: Joi.string().valid('physical', 'kindle').optional(),
    }),
  },

  getPatronWaitlist: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },
};

module.exports = waitlistValidator;
