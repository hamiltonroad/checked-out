import type React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBooks } from './useBooks';
import bookService from '../services/bookService';

vi.mock('../services/bookService');

describe('useBooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call bookService.getAll with default empty params', async () => {
    const mockData = {
      status: 'success',
      data: {
        books: [{ id: 1, title: 'Test Book', authors: [] }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    };
    bookService.getAll.mockResolvedValue(mockData);

    renderHook(() => useBooks(), { wrapper });

    await waitFor(() => {
      expect(bookService.getAll).toHaveBeenCalledTimes(1);
      expect(bookService.getAll).toHaveBeenCalledWith({});
    });
  });

  it('should pass query params to bookService.getAll', async () => {
    const mockData = {
      status: 'success',
      data: {
        books: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
      },
    };
    bookService.getAll.mockResolvedValue(mockData);

    const params = { search: 'gatsby', page: 2, limit: 10 };
    renderHook(() => useBooks(params), { wrapper });

    await waitFor(() => {
      expect(bookService.getAll).toHaveBeenCalledWith(params);
    });
  });

  it('should return loading state initially', () => {
    bookService.getAll.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useBooks(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should return data on success', async () => {
    const mockData = {
      status: 'success',
      data: {
        books: [{ id: 1, title: 'Test Book', authors: [] }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    };
    bookService.getAll.mockResolvedValue(mockData);

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should return error on failure', async () => {
    const mockError = new Error('Failed to fetch books');
    bookService.getAll.mockRejectedValue(mockError);

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });
});
