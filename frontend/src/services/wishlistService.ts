import api from './api';
import type { WishlistEntry } from '../types';

const wishlistService = {
  /**
   * Add a book to the authenticated patron's wishlist
   */
  async addToWishlist(bookId: number) {
    const response = await api.post('/wishlists', { book_id: bookId });
    return response.data.data;
  },

  /**
   * Remove a book from the authenticated patron's wishlist
   */
  async removeFromWishlist(bookId: number) {
    const response = await api.delete('/wishlists', { data: { book_id: bookId } });
    return response.data.data;
  },

  /**
   * Get the wishlist for a patron
   */
  async getWishlist(patronId: number): Promise<WishlistEntry[]> {
    const response = await api.get(`/patrons/${patronId}/wishlist`);
    return response.data.data;
  },
};

export default wishlistService;
