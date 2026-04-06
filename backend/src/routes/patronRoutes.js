const express = require('express');
const patronController = require('../controllers/PatronController');
const { standardLimiter } = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const { ROLES } = require('../config/roles');
const validateRequest = require('../middlewares/validateRequest');
const patronValidator = require('../validators/patronValidator');

const router = express.Router();

router.get(
  '/',
  standardLimiter,
  authenticate,
  requireRole(ROLES.ADMIN),
  validateRequest(patronValidator.getAll),
  patronController.listPatrons
);

router.get(
  '/search',
  standardLimiter,
  authenticate,
  requireRole(ROLES.ADMIN),
  validateRequest(patronValidator.search),
  patronController.searchPatrons
);

router.get(
  '/recent',
  standardLimiter,
  authenticate,
  requireRole(ROLES.ADMIN),
  validateRequest(patronValidator.recent),
  patronController.getRecentPatrons
);

router.get(
  '/:id',
  standardLimiter,
  authenticate,
  requireRole(ROLES.ADMIN),
  validateRequest(patronValidator.getById),
  patronController.getPatronById
);

module.exports = router;
