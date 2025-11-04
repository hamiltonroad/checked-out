import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBooks } from './useBooks';
import bookService from '../services/bookService';

vi.mock('../services/bookService');

describe('useBooks', () => {
  let queryClient;

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

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call bookService.getAll', async () => {
    const mockData = {
      status: 'success',
      data: [{ id: 1, title: 'Test Book', authors: [] }],
    };
    bookService.getAll.mockResolvedValue(mockData);

    renderHook(() => useBooks(), { wrapper });

    await waitFor(() => {
      expect(bookService.getAll).toHaveBeenCalledTimes(1);
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
      data: [{ id: 1, title: 'Test Book', authors: [] }],
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
