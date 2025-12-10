import api from './api';

const checkoutService = {
  createCheckout: async (patronId, copyId) => {
    const response = await api.post('/checkouts', {
      patron_id: patronId,
      copy_id: copyId,
    });
    return response.data;
  },
};

export default checkoutService;
