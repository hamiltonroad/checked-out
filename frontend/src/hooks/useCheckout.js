import { useMutation } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

export function useCheckout() {
  return useMutation({
    mutationFn: ({ patronId, copyId }) =>
      checkoutService.createCheckout(patronId, copyId),
  });
}
