import { useMutation, useQueryClient } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

/**
 * Custom hook for returning a checkout using React Query mutation
 * Automatically invalidates the checkouts query on success
 * @returns {UseMutationResult} React Query mutation result object
 */
export function useReturnCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => checkoutService.returnCheckout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkouts'] });
      queryClient.invalidateQueries({ queryKey: ['checkouts', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['patronCheckouts'] });
      queryClient.invalidateQueries({ queryKey: ['checkouts', 'overdue'] });
    },
  });
}
