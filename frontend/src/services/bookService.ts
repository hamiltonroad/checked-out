import api from './api';

interface BookQueryParams {
  search?: string;
  genre?: string;
  profanity?: string | boolean;
  page?: number;
  limit?: number;
}

const bookService = {
  getAll: async (params: BookQueryParams = {}) => {
    const queryParams: Record<string, string> = {};

    if (params.search) queryParams.search = params.search;
    if (params.genre) queryParams.genre = params.genre;
    if (params.profanity !== undefined) queryParams.profanity = String(params.profanity);
    if (params.page) queryParams.page = String(params.page);
    if (params.limit) queryParams.limit = String(params.limit);

    const response = await api.get('/books', { params: queryParams });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
};

export default bookService;
