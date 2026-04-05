const { Wishlist, Book } = require('../models');
const ApiError = require('../utils/ApiError');

class WishlistService {
  /**
   * Add a book to a patron's wishlist
   */
  async addToWishlist(patronId, bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    const existing = await Wishlist.findOne({
      where: { patron_id: patronId, book_id: bookId },
    });

    if (existing) {
      throw ApiError.conflict('Book is already on your wishlist');
    }

    const entry = await Wishlist.create({
      patron_id: patronId,
      book_id: bookId,
    });

    return entry;
  }

  /**
   * Remove a book from a patron's wishlist
   */
  async removeFromWishlist(patronId, bookId) {
    const entry = await Wishlist.findOne({
      where: { patron_id: patronId, book_id: bookId },
    });

    if (!entry) {
      throw ApiError.notFound('Wishlist entry not found');
    }

    await entry.destroy();

    return { message: 'Book removed from wishlist' };
  }

  /**
   * Get all wishlist entries for a patron with book details
   */
  async getPatronWishlist(patronId) {
    const entries = await Wishlist.findAll({
      where: { patron_id: patronId },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'isbn', 'genre', 'has_profanity'],
          include: [
            {
              association: 'authors',
              attributes: ['id', 'first_name', 'last_name'],
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return entries;
  }
}

module.exports = new WishlistService();
