import api from './api';

const ratingService = {
  /**
   * Submit or update a rating for a book
   */
  async submitRating({ bookId, rating, reviewText }) {
    const response = await api.post('/ratings', {
      bookId,
      rating,
      reviewText,
    });
    return response.data.data; // Extract data from API response wrapper
  },

  /**
   * Get all ratings for a specific book
   */
  async getBookRatings(bookId, params = {}) {
    const response = await api.get(`/books/${bookId}/ratings`, { params });
    return response.data.data; // Extract data from API response wrapper
  },

  /**
   * Get rating statistics for a book
   */
  async getBookRatingStats(bookId) {
    const response = await api.get(`/books/${bookId}/ratings/stats`);
    return response.data.data; // Extract data from API response wrapper
  },

  /**
   * Get current patron's ratings
   */
  async getMyRatings(params = {}) {
    const response = await api.get('/ratings/my-ratings', { params });
    return response.data;
  },

  /**
   * Get current patron's rating for a specific book
   */
  async getMyRatingForBook(bookId) {
    const response = await api.get(`/ratings/books/${bookId}`);
    return response.data;
  },

  /**
   * Delete a rating
   */
  async deleteRating(bookId) {
    const response = await api.delete(`/ratings/books/${bookId}`);
    return response.data;
  },

  /**
   * Get top-rated books
   */
  async getTopRatedBooks(params = {}) {
    const response = await api.get('/books/top-rated', { params });
    return response.data;
  },
};

export default ratingService;