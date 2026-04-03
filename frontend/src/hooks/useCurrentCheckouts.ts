import { useQuery } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

/**
 * Custom hook for fetching current (active) checkouts using React Query
 * @returns React Query result with current checkout data
 */
export function useCurrentCheckouts() {
  return useQuery({
    queryKey: ['checkouts', 'current'],
    queryFn: checkoutService.getCurrentCheckouts,
  });
}
