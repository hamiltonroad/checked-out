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

  /**
   * Get all checkout records
   * @returns {Promise<Object>} API response with array of checkouts
   */
  async getAll() {
    const response = await api.get('/checkouts');
    return response.data;
  },

  /**
   * Return a checked-out book
   * @param {number} id - Checkout ID to return
   * @returns {Promise<Object>} API response with updated checkout
   */
  async returnCheckout(id) {
    const response = await api.put(`/checkouts/${id}/return`);
    return response.data;
  },
};

export default checkoutService;
