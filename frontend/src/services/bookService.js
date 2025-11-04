import api from './api';

const bookService = {
  getAll: async () => {
    const response = await api.get('/v1/books');
    return response.data;
  },
};

export default bookService;
