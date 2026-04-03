import { useQuery } from '@tanstack/react-query';
import copyService from '../services/copyService';

/**
 * Custom hook for fetching available copies for a specific book
 * @param bookId - ID of the book to fetch copies for
 * @returns React Query result with available copies data
 */
export function useAvailableCopies(bookId: number | null | undefined) {
  return useQuery({
    queryKey: ['copies', 'available', bookId],
    queryFn: () => copyService.getAvailableByBook(bookId as number),
    enabled: !!bookId,
  });
}
