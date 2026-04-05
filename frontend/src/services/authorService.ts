import api from './api';

const authorService = {
  getAll: async () => {
    const response = await api.get('/authors');
    return response.data;
  },
};

export default authorService;
