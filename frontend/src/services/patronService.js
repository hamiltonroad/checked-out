import api from './api';

const patronService = {
  /**
   * Fetch patrons, optionally filtered by status
   * @param {Object} [options] - Query options
   * @param {string} [options.status] - Filter by patron status (e.g. 'active')
   * @returns {Promise<Object>} API response with patron data
   */
  async fetchPatrons({ status } = {}) {
    const response = await api.get('/patrons', { params: { status } });
    return response.data;
  },

  /**
   * Fetch a single patron by ID
   * @param {number} id - Patron ID
   * @returns {Promise<Object>} API response with patron detail data
   */
  async getById(id) {
    const response = await api.get(`/patrons/${id}`);
    return response.data;
  },

  /**
   * Search patrons by partial name or card number
   * @param {string} q - Search query (min 2 characters)
   * @param {number} [limit=10] - Maximum results
   * @returns {Promise<Object>} API response with matching patrons
   */
  async searchPatrons(q, limit = 10) {
    const response = await api.get('/patrons/search', { params: { q, limit } });
    return response.data;
  },

  /**
   * Fetch recently checked-out-to patrons for the current user
   * @param {number} [limit=5] - Maximum results
   * @returns {Promise<Object>} API response with recent patrons
   */
  async fetchRecentPatrons(limit = 5) {
    const response = await api.get('/patrons/recent', { params: { limit } });
    return response.data;
  },
};

export default patronService;
