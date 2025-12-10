import api from './api';

const checkoutService = {
  create: async (copyId, patronId) => {
    const response = await api.post('/checkouts', { copyId, patronId });
    return response.data;
  },
};

export default checkoutService;
