import { useQuery } from '@tanstack/react-query';
import bookService from '../services/bookService';

interface UseBooksParams {
  search?: string;
  genre?: string;
  profanity?: string;
  minRating?: number;
  authorId?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook for fetching books with server-side filtering and pagination
 */
export function useBooks(params: UseBooksParams = {}) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => bookService.getAll(params),
  });
}
