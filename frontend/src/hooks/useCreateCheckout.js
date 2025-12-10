import { useMutation, useQueryClient } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

/**
 * Custom hook to create a checkout using React Query mutation
 * @returns {UseMutationResult} React Query mutation result object
 */
export function useCreateCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ copyId, patronId }) => checkoutService.create(copyId, patronId),
    onSuccess: () => {
      // Invalidate books query to refresh availability status
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
