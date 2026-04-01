import { useMutation } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

/**
 * Custom hook for creating checkouts using React Query mutation
 * @returns {UseMutationResult} React Query mutation result object
 */
export function useCheckout() {
  return useMutation({
    mutationFn: (data) => checkoutService.createCheckout(data),
  });
}
