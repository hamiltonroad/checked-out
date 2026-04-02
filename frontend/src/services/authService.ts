import api from './api';
import type { ApiResponse, Patron } from '../types';

const authService = {
  login: async (cardNumber: string, password: string): Promise<ApiResponse<Patron>> => {
    const response = await api.post('/auth/login', {
      card_number: cardNumber,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refresh: async (): Promise<ApiResponse<Patron>> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  me: async (): Promise<ApiResponse<Patron>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
