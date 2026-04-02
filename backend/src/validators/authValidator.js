const Joi = require('joi');

const authValidator = {
  login: {
    body: Joi.object({
      card_number: Joi.string().trim().required().messages({
        'string.empty': 'Card number is required',
        'any.required': 'Card number is required',
      }),
      password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
      }),
    }),
  },
};

module.exports = authValidator;
