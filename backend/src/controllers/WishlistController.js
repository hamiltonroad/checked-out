const wishlistService = require('../services/WishlistService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { hasMinimumRole, ROLES } = require('../config/roles');

class WishlistController {
  /**
   * Add a book to the authenticated patron's wishlist
   */
  async addToWishlist(req, res, next) {
    try {
      const { book_id: bookId } = req.body;
      const patronId = req.patron.id;

      const entry = await wishlistService.addToWishlist(patronId, bookId);

      res.status(201).json(ApiResponse.success(entry, 'Book added to wishlist'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a book from the authenticated patron's wishlist
   */
  async removeFromWishlist(req, res, next) {
    try {
      const { book_id: bookId } = req.body;
      const patronId = req.patron.id;

      const result = await wishlistService.removeFromWishlist(patronId, bookId);

      res.json(ApiResponse.success(result, 'Book removed from wishlist'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get the wishlist for a specific patron (patron can only access their own)
   */
  async getPatronWishlist(req, res, next) {
    try {
      const { id } = req.params;
      const patronId = req.patron.id;

      if (patronId !== parseInt(id, 10) && !hasMinimumRole(req.patron.role, ROLES.LIBRARIAN)) {
        throw ApiError.forbidden('You can only view your own wishlist');
      }

      const entries = await wishlistService.getPatronWishlist(parseInt(id, 10));

      res.json(ApiResponse.success(entries));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WishlistController();
