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
};

export default patronService;
