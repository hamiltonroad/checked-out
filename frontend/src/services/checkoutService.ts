import api from './api';

interface CreateCheckoutParams {
  patron_id: number;
  copy_id: number;
}

const checkoutService = {
  /**
   * Create a new checkout record
   */
  async createCheckout({ patron_id, copy_id }: CreateCheckoutParams) {
    const response = await api.post('/checkouts', { patron_id, copy_id });
    return response.data;
  },

  /**
   * Get all checkout records
   */
  async getAll() {
    const response = await api.get('/checkouts');
    return response.data;
  },

  /**
   * Get current (active) checkout records with due-date info
   */
  async getCurrentCheckouts() {
    const response = await api.get('/checkouts/current');
    return response.data;
  },

  /**
   * Return a checked-out book
   */
  async returnCheckout(id: number) {
    const response = await api.put(`/checkouts/${id}/return`);
    return response.data;
  },
};

export default checkoutService;
