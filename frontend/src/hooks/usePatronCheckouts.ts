import { useQuery } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

/**
 * Hook for fetching checkouts for a specific patron
 * @param patronId - Patron ID to fetch checkouts for
 * @param status - Optional status filter: 'current' or 'returned'
 * @returns React Query result with patron checkout data
 */
export function usePatronCheckouts(patronId: number | undefined, status?: string) {
  return useQuery({
    queryKey: ['patronCheckouts', patronId, status],
    queryFn: () => checkoutService.getByPatron(patronId!, status),
    enabled: !!patronId,
  });
}
