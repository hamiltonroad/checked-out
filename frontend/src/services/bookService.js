import api from './api';

const bookService = {
  getAll: async () => {
    const response = await api.get('/books');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
};

export default bookService;
