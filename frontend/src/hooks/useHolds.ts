import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import holdService from '../services/holdService';
import { useAuth } from './useAuth';

/**
 * Hook for fetching a patron's active holds
 */
export function usePatronHolds(patronId: number | undefined) {
  return useQuery({
    queryKey: ['holds', 'patron', patronId],
    queryFn: () => holdService.getPatronHolds(patronId!),
    enabled: Boolean(patronId),
  });
}

/**
 * Hook for fetching the authenticated patron's own holds
 */
export function useMyHolds() {
  const { patron } = useAuth();
  return usePatronHolds(patron?.id);
}

/**
 * Hook for checking out a held copy
 */
export function useCheckoutHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (copyId: number) => holdService.checkoutHold(copyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      queryClient.invalidateQueries({ queryKey: ['checkouts'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['copies'] });
    },
  });
}
