import api from './api';

const checkoutService = {
  /**
   * Create a new checkout record
   * @param {Object} params - Checkout parameters
   * @param {number} params.patron_id - ID of the patron
   * @param {number} params.copy_id - ID of the copy to check out
   * @returns {Promise<Object>} API response with checkout data
   */
  async createCheckout({ patron_id, copy_id }) {
    const response = await api.post('/checkouts', { patron_id, copy_id });
    return response.data;
  },
};

export default checkoutService;
