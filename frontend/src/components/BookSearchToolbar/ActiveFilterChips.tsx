import { Chip, Button, Box } from '@mui/material';
import PropTypes from 'prop-types';
import type { AuthorSummary } from '../../types';
import { AVAILABILITY_FILTERS, AVAILABILITY_FILTER_LABELS } from './constants';

interface ActiveFilterChipsProps {
  debouncedSearchTerm: string;
  onClearSearch: () => void;
  availabilityFilter: string;
  onAvailabilityChange: (value: string) => void;
  hideProfanity: boolean;
  onHideProfanityChange: (value: boolean) => void;
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
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

ActiveFilterChips.propTypes = {
  debouncedSearchTerm: PropTypes.string.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  availabilityFilter: PropTypes.string.isRequired,
  onAvailabilityChange: PropTypes.func.isRequired,
  hideProfanity: PropTypes.bool.isRequired,
  onHideProfanityChange: PropTypes.func.isRequired,
  selectedGenres: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onGenresChange: PropTypes.func.isRequired,
  minRating: PropTypes.number.isRequired,
  onMinRatingChange: PropTypes.func.isRequired,
  selectedAuthors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  onAuthorsChange: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
};

export default ActiveFilterChips;
