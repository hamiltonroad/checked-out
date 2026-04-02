import { useMutation } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

interface CheckoutData {
  patron_id: number;
  copy_id: number;
}

/**
 * Custom hook for creating checkouts using React Query mutation
 */
export function useCheckout() {
  return useMutation({
    mutationFn: (data: CheckoutData) => checkoutService.createCheckout(data),
  });
}
