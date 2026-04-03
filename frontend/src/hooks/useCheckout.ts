import { useMutation, useQueryClient } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

interface CheckoutData {
  patron_id: number;
  copy_id: number;
}

/**
 * Custom hook for creating checkouts using React Query mutation.
 * Invalidates checkout queries on success so lists auto-refresh.
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutData) => checkoutService.createCheckout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkouts'] });
      queryClient.invalidateQueries({ queryKey: ['checkouts', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['checkouts', 'overdue'] });
    },
  });
}
