import api from './api';
import type { HoldData } from '../types';

const holdService = {
  /**
   * Get active holds for a patron
   */
  async getPatronHolds(patronId: number): Promise<HoldData[]> {
    const response = await api.get(`/patrons/${patronId}/holds`);
    return response.data.data;
  },

  /**
   * Check out a held copy (uses existing checkout endpoint)
   */
  async checkoutHold(copyId: number) {
    const response = await api.post('/checkouts', { copy_id: copyId });
    return response.data.data;
  },
};

export default holdService;
