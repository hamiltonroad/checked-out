import { useQuery } from '@tanstack/react-query';
import bookService from '../services/bookService';

/**
 * Custom hook to fetch a single book by ID using React Query
 * @param {number|null} id - Book ID to fetch
 * @returns {UseQueryResult} React Query result object with book data, loading and error states
 */
export function useBook(id) {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => bookService.getById(id),
    enabled: !!id,
  });
}
