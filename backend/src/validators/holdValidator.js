const Joi = require('joi');

/**
 * Hold Validator - Joi schemas for hold endpoints
 */
const holdValidator = {
  getPatronHolds: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },
};

module.exports = holdValidator;
