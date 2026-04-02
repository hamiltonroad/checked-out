import api from './api';

const authService = {
  login: async (cardNumber, password) => {
    const response = await api.post('/auth/login', {
      card_number: cardNumber,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refresh: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
