import api from './api';

/**
 * Checkout Service - API calls for checkout operations
 */
const checkoutService = {
  /**
   * Create a new checkout
   * @param {Object} data - Checkout data
   * @param {number} data.patron_id - ID of the patron
   * @param {number} data.copy_id - ID of the copy
   * @param {string} [data.due_date] - Optional due date (ISO string)
   * @returns {Promise<Object>} Created checkout data
   */
  createCheckout: async (data) => {
    const response = await api.post('/checkouts', data);
    return response.data;
  },
};

export default checkoutService;
