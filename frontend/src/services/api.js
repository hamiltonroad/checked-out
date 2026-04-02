import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // Send cookies with every request
});

api.interceptors.request.use((config) => {
  // Read CSRF token from cookie and attach as header for state-changing requests
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('_csrf='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  // Development fallback: use X-Patron-Id header when VITE_DEV_AUTH is enabled
  if (import.meta.env.VITE_DEV_AUTH === 'true') {
    const patronId = localStorage.getItem('patronId') || '1';
    config.headers['X-Patron-Id'] = patronId;
  }

  return config;
});

export default api;
