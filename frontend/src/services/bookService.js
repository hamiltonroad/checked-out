import api from './api';

const bookService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.search) query.set('search', params.search);
    if (params.genre) query.set('genre', params.genre);
    if (params.profanity !== undefined) query.set('profanity', String(params.profanity));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const queryString = query.toString();
    const url = queryString ? `/books?${queryString}` : '/books';
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
};

export default bookService;
