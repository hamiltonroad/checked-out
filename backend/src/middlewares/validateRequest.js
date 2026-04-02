const ApiError = require('../utils/ApiError');

/**
 * Transform Joi error details into field-level error objects.
 * @param {Array} details - Joi validation error details
 * @returns {Array<{field: string, message: string}>} Field-level error objects
 */
const mapValidationErrors = (details) =>
  details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));

const validateRequest = (schema) => (req, res, next) => {
  const validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  // Validate query parameters
  if (schema.query) {
    const { error, value } = schema.query.validate(req.query, validationOptions);
    if (error) {
      const errors = mapValidationErrors(error.details);
      return next(ApiError.badRequest('Validation error', errors));
    }
    req.query = value;
  }

  // Validate request body
  if (schema.body) {
    const { error, value } = schema.body.validate(req.body, validationOptions);
    if (error) {
      const errors = mapValidationErrors(error.details);
      return next(ApiError.badRequest('Validation error', errors));
    }
    req.body = value;
  }

  // Validate route parameters
  if (schema.params) {
    const { error, value } = schema.params.validate(req.params, validationOptions);
    if (error) {
      const errors = mapValidationErrors(error.details);
      return next(ApiError.badRequest('Validation error', errors));
    }
    req.params = value;
  }

  next();
};

module.exports = validateRequest;
