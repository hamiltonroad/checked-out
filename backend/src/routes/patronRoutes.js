const express = require('express');
const patronController = require('../controllers/PatronController');
const { standardLimiter } = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');
const patronValidator = require('../validators/patronValidator');

const router = express.Router();

router.get(
  '/',
  standardLimiter,
  authenticate,
  validateRequest(patronValidator.getAll),
  patronController.listPatrons
);

module.exports = router;
