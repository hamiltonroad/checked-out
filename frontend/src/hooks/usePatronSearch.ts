import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import patronService from '../services/patronService';

const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

/**
 * Hook for debounced server-side patron search
 * @param searchTerm - Raw input from the search field
 * @returns React Query result; only fires when input >= 2 characters
 */
export function usePatronSearch(searchTerm: string) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return useQuery({
    queryKey: ['patrons', 'search', debouncedTerm],
    queryFn: () => patronService.searchPatrons(debouncedTerm),
    enabled: debouncedTerm.length >= MIN_SEARCH_LENGTH,
  });
}
