import { useMutation, useQueryClient } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

/**
 * Custom hook for checkout mutation
 * @returns {Object} Mutation object with mutate, isLoading, error
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkoutService.createCheckout,
    onSuccess: () => {
      // Invalidate books queries to refresh availability status
      queryClient.invalidateQueries(['books']);
      queryClient.invalidateQueries(['book']);
    },
  });
}
