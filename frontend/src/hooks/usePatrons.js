import { useQuery } from '@tanstack/react-query';
import patronService from '../services/patronService';

/**
 * Hook for fetching patrons with optional status filter
 * @param {Object} [params] - Query parameters
 * @param {string} [params.status] - Filter by patron status (e.g. 'active')
 * @returns {Object} React Query result with data, isLoading, isError, error
 */
export function usePatrons(params = {}) {
  return useQuery({
    queryKey: ['patrons', params],
    queryFn: () => patronService.fetchPatrons(params),
  });
}
