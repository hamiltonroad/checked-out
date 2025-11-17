import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // For development/testing: use patron ID from localStorage
  const patronId = localStorage.getItem('patronId') || '1';
  if (patronId) {
    config.headers['X-Patron-Id'] = patronId;
  }
  return config;
});

export default api;
