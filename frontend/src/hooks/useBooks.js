import { useQuery } from '@tanstack/react-query';
import bookService from '../services/bookService';

/**
 * Hook for fetching books with server-side filtering and pagination
 * @param {Object} params - Query parameters for server-side filtering
 * @param {string} [params.search] - Search term for title/author
 * @param {string} [params.genre] - Genre filter
 * @param {string} [params.profanity] - Profanity filter ('true'/'false')
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Results per page
 * @returns {Object} React Query result with data, isLoading, error
 */
export function useBooks(params = {}) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => bookService.getAll(params),
  });
}
