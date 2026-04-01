import PropTypes from 'prop-types';
import {
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { AVAILABILITY_FILTERS, AVAILABILITY_FILTER_LABELS } from './constants';

/**
 * BookSearchToolbar provides search, availability filtering, profanity filtering,
 * filter chips, and a clear-all button for the BooksPage.
 */
function BookSearchToolbar({
  searchTerm,
  onSearchChange,
  searchInputRef,
  availabilityFilter,
  onAvailabilityChange,
  hideProfanity,
  onHideProfanityChange,
  onClearAll,
  filteredCount,
  totalCount,
  debouncedSearchTerm,
  onClearSearch,
}) {
  const hasActiveFilters =
    debouncedSearchTerm || availabilityFilter !== AVAILABILITY_FILTERS.ALL || hideProfanity;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'flex-start',
          mb: 1.5,
        }}
      >
        <TextField
          fullWidth
          label="Search Books"
          placeholder="Search by title or author... (⌘K or Ctrl+K)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          inputRef={searchInputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => onSearchChange('')} aria-label="Clear search">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel id="availability-filter-label">Availability</InputLabel>
          <Select
            labelId="availability-filter-label"
            id="availability-filter"
            value={availabilityFilter}
            label="Availability"
            onChange={(e) => onAvailabilityChange(e.target.value)}
          >
            <MenuItem value={AVAILABILITY_FILTERS.ALL}>
              {AVAILABILITY_FILTER_LABELS[AVAILABILITY_FILTERS.ALL]}
            </MenuItem>
            <MenuItem value={AVAILABILITY_FILTERS.AVAILABLE}>
              {AVAILABILITY_FILTER_LABELS[AVAILABILITY_FILTERS.AVAILABLE]}
            </MenuItem>
            <MenuItem value={AVAILABILITY_FILTERS.CHECKED_OUT}>
              {AVAILABILITY_FILTER_LABELS[AVAILABILITY_FILTERS.CHECKED_OUT]}
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ mt: 1 }}>
        <FormControlLabel
          control={<Checkbox checked={hideProfanity} onChange={(e) => onHideProfanityChange(e.target.checked)} />}
          label="Hide books with profanity"
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Showing {filteredCount} of {totalCount} books
      </Typography>
      {hasActiveFilters && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mt: 2,
            alignItems: 'center',
          }}
        >
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
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={onClearAll}
              sx={{ ml: 0.5 }}
              aria-label="Clear all filters"
            >
              Clear all filters
            </Button>
          )}
        </Box>
      )}
    </>
  );
}

BookSearchToolbar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  searchInputRef: PropTypes.object.isRequired,
  availabilityFilter: PropTypes.string.isRequired,
  onAvailabilityChange: PropTypes.func.isRequired,
  hideProfanity: PropTypes.bool.isRequired,
  onHideProfanityChange: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  filteredCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  debouncedSearchTerm: PropTypes.string.isRequired,
  onClearSearch: PropTypes.func.isRequired,
};

export default BookSearchToolbar;
