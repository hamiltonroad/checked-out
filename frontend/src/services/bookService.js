import api from './api';

const bookService = {
  getAll: async (params = {}) => {
    const queryParams = {};

    if (params.search) queryParams.search = params.search;
    if (params.genre) queryParams.genre = params.genre;
    if (params.profanity !== undefined) queryParams.profanity = String(params.profanity);
    if (params.page) queryParams.page = String(params.page);
    if (params.limit) queryParams.limit = String(params.limit);

    const response = await api.get('/books', { params: queryParams });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
};

export default bookService;
