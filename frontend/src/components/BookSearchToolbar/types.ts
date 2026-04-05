import type { RefObject } from 'react';
import type { AuthorSummary } from '../../types';

export interface BookSearchToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  availabilityFilter: string;
  onAvailabilityChange: (value: string) => void;
  hideProfanity: boolean;
  onHideProfanityChange: (value: boolean) => void;
  onClearAll: () => void;
  filteredCount: number;
  totalCount: number;
  debouncedSearchTerm: string;
  onClearSearch: () => void;
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  selectedAuthors: AuthorSummary[];
  onAuthorsChange: (authors: AuthorSummary[]) => void;
  authors: AuthorSummary[];
  authorsLoading: boolean;
  authorsError: boolean;
}
