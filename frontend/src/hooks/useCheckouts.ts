import { useQuery } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

/**
 * Custom hook for fetching all checkouts using React Query
 * @returns {UseQueryResult} React Query result with checkout data
 */
export function useCheckouts() {
  return useQuery({
    queryKey: ['checkouts'],
    queryFn: checkoutService.getAll,
  });
}
