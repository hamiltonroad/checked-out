const express = require('express');
const waitlistController = require('../controllers/WaitlistController');
const waitlistValidator = require('../validators/waitlistValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');
const requireOwnerOrRole = require('../middlewares/requireOwnerOrRole');
const { ROLES } = require('../config/roles');
const { standardLimiter, strictLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// All waitlist routes require authentication
router.use(authenticate);

// Waitlist operations
router.post(
  '/waitlist',
  strictLimiter,
  validateRequest(waitlistValidator.join),
  waitlistController.joinWaitlist
);

router.delete(
  '/waitlist',
  strictLimiter,
  validateRequest(waitlistValidator.leave),
  waitlistController.leaveWaitlist
);

// Book waitlist (nested under books)
router.get(
  '/books/:id/waitlist',
  standardLimiter,
  validateRequest(waitlistValidator.getBookWaitlist),
  waitlistController.getBookWaitlist
);

// Patron waitlist (nested under patrons)
router.get(
  '/patrons/:id/waitlist',
  standardLimiter,
  validateRequest(waitlistValidator.getPatronWaitlist),
  requireOwnerOrRole(ROLES.LIBRARIAN),
  waitlistController.getPatronWaitlist
);

module.exports = router;
