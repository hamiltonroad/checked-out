import api from './api';

const checkoutService = {
  /**
   * Create a new checkout record
   */
  async createCheckout({ copyId, patronId, checkoutDate, dueDate }) {
    const response = await api.post('/checkouts', {
      copy_id: copyId,
      patron_id: patronId,
      checkout_date: checkoutDate,
      due_date: dueDate,
    });
    return response.data.data; // Extract data from API response wrapper
  },
};

export default checkoutService;
