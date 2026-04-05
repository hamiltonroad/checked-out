import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import authService from './authService';
import { getAuthClearFn } from '../hooks/useAuth';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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

// --- 401 Response Interceptor: automatic token refresh ---

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(undefined);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip interceptor for non-401, already-retried, or auth endpoints (avoid loops)
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/me');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Queue concurrent 401 requests behind a single refresh attempt
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await authService.refresh();
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      const clearAuth = getAuthClearFn();
      if (clearAuth) clearAuth();
      window.location.href = '/login?sessionExpired=true';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
