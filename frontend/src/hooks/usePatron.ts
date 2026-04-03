import { useQuery } from '@tanstack/react-query';
import patronService from '../services/patronService';

/**
 * Hook for fetching a single patron by ID
 * @param patronId - Patron ID to fetch
 * @returns React Query result with patron data
 */
export function usePatron(patronId: number | undefined) {
  return useQuery({
    queryKey: ['patron', patronId],
    queryFn: () => patronService.getById(patronId!),
    enabled: !!patronId,
  });
}
