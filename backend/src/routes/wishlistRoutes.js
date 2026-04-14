const express = require('express');
const wishlistController = require('../controllers/WishlistController');
const wishlistValidator = require('../validators/wishlistValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');
const requireOwnerOrRole = require('../middlewares/requireOwnerOrRole');
const { ROLES } = require('../config/roles');
const { standardLimiter, strictLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

// Wishlist CRUD
router.post(
  '/wishlists',
  strictLimiter,
  validateRequest(wishlistValidator.add),
  wishlistController.addToWishlist
);

router.delete(
  '/wishlists',
  strictLimiter,
  validateRequest(wishlistValidator.remove),
  wishlistController.removeFromWishlist
);

// Patron's wishlist (nested under patrons)
router.get(
  '/patrons/:id/wishlist',
  standardLimiter,
  validateRequest(wishlistValidator.getPatronWishlist),
  requireOwnerOrRole(ROLES.LIBRARIAN),
  wishlistController.getPatronWishlist
);

module.exports = router;
