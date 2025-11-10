import api from './api';

const reviewService = {
  getReviewsByBook: async (bookId, { limit = 10, offset = 0 } = {}) => {
    const response = await api.get(`/v1/books/${bookId}/reviews`, {
      params: { limit, offset },
    });
    return response.data;
  },

  createReview: async (bookId, { rating, reviewText, patronId }) => {
    // TODO: Remove patronId when authentication is implemented
    const response = await api.post(`/v1/books/${bookId}/reviews`, {
      rating,
      reviewText,
      patronId,
    });
    return response.data;
  },

  updateReview: async (reviewId, { rating, reviewText, patronId }) => {
    // TODO: Remove patronId when authentication is implemented
    const response = await api.put(`/v1/reviews/${reviewId}`, {
      rating,
      reviewText,
      patronId,
    });
    return response.data;
  },

  deleteReview: async (reviewId, patronId) => {
    // TODO: Remove patronId when authentication is implemented
    const response = await api.delete(`/v1/reviews/${reviewId}`, {
      params: { patronId },
    });
    return response.data;
  },
};

export default reviewService;
