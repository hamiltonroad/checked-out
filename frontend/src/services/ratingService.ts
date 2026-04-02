import api from './api';

interface SubmitRatingParams {
  bookId: number;
  rating: number;
  reviewText: string;
}

const ratingService = {
  /**
   * Submit or update a rating for a book
   */
  async submitRating({ bookId, rating, reviewText }: SubmitRatingParams) {
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
  async getBookRatings(bookId: number, params: Record<string, unknown> = {}) {
    const response = await api.get(`/books/${bookId}/ratings`, { params });
    return response.data.data; // Extract data from API response wrapper
  },

  /**
   * Get rating statistics for a book
   */
  async getBookRatingStats(bookId: number) {
    const response = await api.get(`/books/${bookId}/ratings/stats`);
    return response.data.data; // Extract data from API response wrapper
  },

  /**
   * Get current patron's ratings
   */
  async getMyRatings(params: Record<string, unknown> = {}) {
    const response = await api.get('/ratings/my-ratings', { params });
    return response.data;
  },

  /**
   * Get current patron's rating for a specific book
   */
  async getMyRatingForBook(bookId: number) {
    const response = await api.get(`/ratings/books/${bookId}`);
    return response.data;
  },

  /**
   * Delete a rating
   */
  async deleteRating(bookId: number) {
    const response = await api.delete(`/ratings/books/${bookId}`);
    return response.data;
  },

  /**
   * Get top-rated books
   */
  async getTopRatedBooks(params: Record<string, unknown> = {}) {
    const response = await api.get('/books/top-rated', { params });
    return response.data;
  },
};

export default ratingService;
