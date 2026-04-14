const express = require('express');
const holdController = require('../controllers/HoldController');
const holdValidator = require('../validators/holdValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');
const requireOwnerOrRole = require('../middlewares/requireOwnerOrRole');
const { ROLES } = require('../config/roles');
const { standardLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// All hold routes require authentication
router.use(authenticate);

// Patron holds (nested under patrons)
router.get(
  '/patrons/:id/holds',
  standardLimiter,
  validateRequest(holdValidator.getPatronHolds),
  requireOwnerOrRole(ROLES.LIBRARIAN),
  holdController.getPatronHolds
);

module.exports = router;
