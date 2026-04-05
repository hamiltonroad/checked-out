import { useState, useEffect, useCallback, useMemo, useRef, type RefObject } from 'react';
import type { AuthorSummary } from '../types';

const AVAILABILITY_ALL = 'all';

interface BookFiltersReturn {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  debouncedSearchTerm: string;
  availabilityFilter: string;
  setAvailabilityFilter: (value: string) => void;
  hideProfanity: boolean;
  setHideProfanity: (value: boolean) => void;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  selectedAuthors: AuthorSummary[];
  setSelectedAuthors: (authors: AuthorSummary[]) => void;
  page: number;
  setPage: (page: number) => void;
  queryParams: Record<string, string | number>;
  handleClearAll: () => void;
  handleClearSearch: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Custom hook managing all filter state for the BooksPage.
 * Owns debounce, page reset on filter change, clear-all, and query param construction.
 */
export function useBookFilters(): BookFiltersReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState(AVAILABILITY_ALL);
  const [hideProfanity, setHideProfanity] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedAuthors, setSelectedAuthors] = useState<AuthorSummary[]>([]);
  const [page, setPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [hideProfanity, selectedGenres, minRating, selectedAuthors]);

  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setAvailabilityFilter(AVAILABILITY_ALL);
    setHideProfanity(false);
    setSelectedGenres([]);
    setMinRating(0);
    setSelectedAuthors([]);
    setPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, limit: 20 };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (hideProfanity) params.profanity = 'false';
    if (selectedGenres.length > 0) params.genre = selectedGenres.join(',');
    if (minRating > 0) params.minRating = minRating;
    if (selectedAuthors.length > 0) params.authorId = selectedAuthors.map((a) => a.id).join(',');
    return params;
  }, [debouncedSearchTerm, hideProfanity, selectedGenres, minRating, selectedAuthors, page]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    availabilityFilter,
    setAvailabilityFilter,
    hideProfanity,
    setHideProfanity,
    selectedGenres,
    setSelectedGenres,
    minRating,
    setMinRating,
    selectedAuthors,
    setSelectedAuthors,
    page,
    setPage,
    queryParams,
    handleClearAll,
    handleClearSearch,
    searchInputRef,
  };
}
