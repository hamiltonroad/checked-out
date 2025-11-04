const ApiError = require('../utils/ApiError');

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
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(ApiError.badRequest(errorMessage));
    }
    req.query = value;
  }

  // Validate request body
  if (schema.body) {
    const { error, value } = schema.body.validate(req.body, validationOptions);
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(ApiError.badRequest(errorMessage));
    }
    req.body = value;
  }

  // Validate route parameters
  if (schema.params) {
    const { error, value } = schema.params.validate(req.params, validationOptions);
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(ApiError.badRequest(errorMessage));
    }
    req.params = value;
  }

  next();
};

module.exports = validateRequest;
