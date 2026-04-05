import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import waitlistService from '../services/waitlistService';

/**
 * Hook for fetching the waitlist for a book (optionally filtered by format)
 */
export function useBookWaitlist(bookId: number | null | undefined, format?: string) {
  return useQuery({
    queryKey: ['waitlist', bookId, format],
    queryFn: () => waitlistService.getBookWaitlist(bookId!, format),
    enabled: Boolean(bookId),
  });
}

/**
 * Hook for fetching a patron's waitlist entries
 */
export function usePatronWaitlist(patronId: number | undefined) {
  return useQuery({
    queryKey: ['waitlist', 'patron', patronId],
    queryFn: () => waitlistService.getPatronWaitlist(patronId!),
    enabled: Boolean(patronId),
  });
}

/**
 * Hook for joining the waitlist
 */
export function useJoinWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, format }: { bookId: number; format: string }) =>
      waitlistService.joinWaitlist(bookId, format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

/**
 * Hook for leaving the waitlist
 */
export function useLeaveWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, format }: { bookId: number; format: string }) =>
      waitlistService.leaveWaitlist(bookId, format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
