import { useQuery } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

/**
 * Custom hook for fetching overdue checkouts using React Query
 * @returns React Query result with overdue checkout data
 */
export function useOverdueCheckouts() {
  return useQuery({
    queryKey: ['checkouts', 'overdue'],
    queryFn: checkoutService.getOverdueCheckouts,
  });
}
