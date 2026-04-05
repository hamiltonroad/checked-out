import api from './api';

interface CreateCheckoutParams {
  copy_id: number;
}

const checkoutService = {
  /**
   * Create a new checkout record.
   * Patron is derived from the authenticated session on the backend.
   */
  async createCheckout({ copy_id }: CreateCheckoutParams) {
    const response = await api.post('/checkouts', { copy_id });
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
   * Get overdue checkout records
   */
  async getOverdueCheckouts() {
    const response = await api.get('/checkouts/overdue');
    return response.data;
  },

  /**
   * Return a checked-out book
   */
  async returnCheckout(id: number) {
    const response = await api.put(`/checkouts/${id}/return`);
    return response.data;
  },

  /**
   * Get checkouts for a specific patron, optionally filtered by status
   */
  async getByPatron(patronId: number, status?: string) {
    const params: Record<string, string> = {};
    if (status) {
      params.status = status;
    }
    const response = await api.get(`/checkouts/patron/${patronId}`, { params });
    return response.data;
  },
};

export default checkoutService;
