import { useQuery } from '@tanstack/react-query';
import patronService from '../services/patronService';

/**
 * Hook to fetch recently checked-out-to patrons for the current user
 * @returns React Query result with recent patron data
 */
export function useRecentPatrons() {
  return useQuery({
    queryKey: ['patrons', 'recent'],
    queryFn: () => patronService.fetchRecentPatrons(),
  });
}
