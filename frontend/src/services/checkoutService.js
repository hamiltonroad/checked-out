import api from './api';

const checkoutService = {
  /**
   * Create a new checkout
   */
  async createCheckout(patronId, copyId) {
    const response = await api.post('/checkouts', {
      patronId,
      copyId,
    });
    return response.data.data; // Extract data from API response wrapper
  },
};

export default checkoutService;
