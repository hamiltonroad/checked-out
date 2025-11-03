const ApiError = require('../utils/ApiError');

const validateRequest = (schema) => (req, res, next) => {
  const validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  const { error, value } = schema.validate(req.body, validationOptions);

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(ApiError.badRequest(errorMessage));
  }

  req.body = value;
  next();
};

module.exports = validateRequest;
