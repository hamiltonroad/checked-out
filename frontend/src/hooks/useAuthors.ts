import { useQuery } from '@tanstack/react-query';
import authorService from '../services/authorService';

/**
 * Hook for fetching the full author list for autocomplete
 */
export function useAuthors() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: () => authorService.getAll(),
    staleTime: 5 * 60 * 1000, // Authors change rarely; cache 5 minutes
  });
}
