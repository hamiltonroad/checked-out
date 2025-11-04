import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBook } from './useBook';
import bookService from '../services/bookService';
import { vi } from 'vitest';

vi.mock('../services/bookService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useBook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch book by id successfully', async () => {
    const mockBook = {
      data: {
        id: 1,
        title: 'Test Book',
        isbn: '1234567890',
        authors: [{ first_name: 'John', last_name: 'Doe' }],
      },
    };
    bookService.getById.mockResolvedValue(mockBook);

    const { result } = renderHook(() => useBook(1), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockBook);
    expect(bookService.getById).toHaveBeenCalledWith(1);
    expect(bookService.getById).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when fetching book fails', async () => {
    const mockError = new Error('Failed to fetch book');
    bookService.getById.mockRejectedValue(mockError);

    const { result } = renderHook(() => useBook(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
    expect(bookService.getById).toHaveBeenCalledWith(1);
  });

  it('should not fetch when id is null', () => {
    const { result } = renderHook(() => useBook(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(bookService.getById).not.toHaveBeenCalled();
  });

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useBook(undefined), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(bookService.getById).not.toHaveBeenCalled();
  });

  it('should use correct query key with book id', async () => {
    const mockBook = { data: { id: 5, title: 'Book 5' } };
    bookService.getById.mockResolvedValue(mockBook);

    const { result } = renderHook(() => useBook(5), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(bookService.getById).toHaveBeenCalledWith(5);
  });

  it('should refetch when id changes', async () => {
    const mockBook1 = { data: { id: 1, title: 'Book 1' } };
    const mockBook2 = { data: { id: 2, title: 'Book 2' } };

    bookService.getById.mockResolvedValueOnce(mockBook1).mockResolvedValueOnce(mockBook2);

    const { result, rerender } = renderHook(({ id }) => useBook(id), {
      wrapper: createWrapper(),
      initialProps: { id: 1 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBook1);

    rerender({ id: 2 });

    await waitFor(() => expect(result.current.data).toEqual(mockBook2));
    expect(bookService.getById).toHaveBeenCalledTimes(2);
    expect(bookService.getById).toHaveBeenNthCalledWith(1, 1);
    expect(bookService.getById).toHaveBeenNthCalledWith(2, 2);
  });
});
