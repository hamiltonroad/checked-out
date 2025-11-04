import api from './api';

const bookService = {
  getAll: async () => {
    const response = await api.get('/v1/books');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/v1/books/${id}`);
    return response.data;
  },
};

export default bookService;
