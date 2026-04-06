import { Chip, Button, Box } from '@mui/material';
import type { AuthorSummary } from '../../types';
import { AVAILABILITY_FILTERS, AVAILABILITY_FILTER_LABELS, FORMAT_OPTIONS } from './constants';

interface ActiveFilterChipsProps {
  debouncedSearchTerm: string;
  onClearSearch: () => void;
  availabilityFilter: string;
  onAvailabilityChange: (value: string) => void;
  hideProfanity: boolean;
  onHideProfanityChange: (value: boolean) => void;
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
  selectedFormats: string[];
  onFormatsChange: (formats: string[]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  selectedAuthors: AuthorSummary[];
  onAuthorsChange: (authors: AuthorSummary[]) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

/**
 * ActiveFilterChips displays removable chips for each active filter
 * and a "Clear all" button when any filters are active.
 */
function ActiveFilterChips({
  debouncedSearchTerm,
  onClearSearch,
  availabilityFilter,
  onAvailabilityChange,
  hideProfanity,
  onHideProfanityChange,
  selectedGenres,
  onGenresChange,
  selectedFormats,
  onFormatsChange,
  minRating,
  onMinRatingChange,
  selectedAuthors,
  onAuthorsChange,
  onClearAll,
  hasActiveFilters,
}: ActiveFilterChipsProps) {
  if (!hasActiveFilters) return null;

  const handleRemoveGenre = (genre: string) => {
    onGenresChange(selectedGenres.filter((g) => g !== genre));
  };

  const handleRemoveFormat = (format: string) => {
    onFormatsChange(selectedFormats.filter((f) => f !== format));
  };

  const handleRemoveAuthor = (authorId: number) => {
    onAuthorsChange(selectedAuthors.filter((a) => a.id !== authorId));
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, alignItems: 'center' }}>
      {debouncedSearchTerm && (
        <Chip
          label={`Search: "${debouncedSearchTerm}"`}
          onDelete={onClearSearch}
          size="small"
          variant="outlined"
          aria-label={`Remove search filter: ${debouncedSearchTerm}`}
        />
      )}
      {availabilityFilter !== AVAILABILITY_FILTERS.ALL && (
        <Chip
          label={`Availability: ${AVAILABILITY_FILTER_LABELS[availabilityFilter]}`}
          onDelete={() => onAvailabilityChange(AVAILABILITY_FILTERS.ALL)}
          size="small"
          variant="outlined"
          aria-label={`Remove availability filter: ${AVAILABILITY_FILTER_LABELS[availabilityFilter]}`}
        />
      )}
      {hideProfanity && (
        <Chip
          label="Hiding profanity"
          onDelete={() => onHideProfanityChange(false)}
          size="small"
          variant="outlined"
          aria-label="Remove profanity filter"
        />
      )}
      {selectedGenres.map((genre) => (
        <Chip
          key={genre}
          label={`Genre: ${genre}`}
          onDelete={() => handleRemoveGenre(genre)}
          size="small"
          variant="outlined"
          aria-label={`Remove genre filter: ${genre}`}
        />
      ))}
      {selectedFormats.map((format) => {
        const label = FORMAT_OPTIONS.find((o) => o.value === format)?.label || format;
        return (
          <Chip
            key={format}
            label={`Format: ${label}`}
            onDelete={() => handleRemoveFormat(format)}
            size="small"
            variant="outlined"
            aria-label={`Remove format filter: ${label}`}
          />
        );
      })}
      {minRating > 0 && (
        <Chip
          label={`Rating: ${minRating}+ Stars`}
          onDelete={() => onMinRatingChange(0)}
          size="small"
          variant="outlined"
          aria-label={`Remove rating filter: ${minRating}+ Stars`}
        />
      )}
      {selectedAuthors.map((author) => (
        <Chip
          key={author.id}
          label={`Author: ${author.last_name}, ${author.first_name}`}
          onDelete={() => handleRemoveAuthor(author.id)}
          size="small"
          variant="outlined"
          aria-label={`Remove author filter: ${author.last_name}, ${author.first_name}`}
        />
      ))}
      <Button size="small" onClick={onClearAll} sx={{ ml: 0.5 }} aria-label="Clear all filters">
        Clear all filters
      </Button>
    </Box>
  );
}

export default ActiveFilterChips;
