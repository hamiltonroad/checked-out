const Joi = require('joi');

const ratingSchema = Joi.object({
  bookId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  reviewText: Joi.string().max(2000).allow('', null).optional(),
});

const validateRating = (req, res, next) => {
  const { error } = ratingSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

module.exports = {
  validateRating,
};