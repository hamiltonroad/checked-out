import api from './api';

const bookService = {
  getAll: () => api.get('/v1/books').then((res) => res.data),
};

export default bookService;
