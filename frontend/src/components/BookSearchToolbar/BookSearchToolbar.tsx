import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SearchField from './SearchField';
import {
  AVAILABILITY_FILTERS,
  AVAILABILITY_OPTIONS,
  GENRE_OPTIONS,
  FORMAT_OPTIONS,
  RATING_FILTER_OPTIONS,
  FILTER_ROW_SX,
  FILTER_CONTROL_SX,
} from './constants';
import type { BookSearchToolbarProps } from './types';
import ActiveFilterChips from './ActiveFilterChips';

/** BookSearchToolbar provides search, filtering controls, and active filter chips. */
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
  selectedGenres,
  onGenresChange,
  selectedFormats,
  onFormatsChange,
  minRating,
  onMinRatingChange,
  selectedAuthors,
  onAuthorsChange,
  authors,
  authorsLoading,
  authorsError,
}: BookSearchToolbarProps) {
  const hasActiveFilters =
    debouncedSearchTerm ||
    availabilityFilter !== AVAILABILITY_FILTERS.ALL ||
    hideProfanity ||
    selectedGenres.length > 0 ||
    selectedFormats.length > 0 ||
    minRating > 0 ||
    selectedAuthors.length > 0;

  return (
    <>
      <Box sx={FILTER_ROW_SX}>
        <SearchField
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchInputRef={searchInputRef}
        />
        <FormControl sx={FILTER_CONTROL_SX}>
          <InputLabel id="availability-filter-label">Availability</InputLabel>
          <Select
            labelId="availability-filter-label"
            id="availability-filter"
            value={availabilityFilter}
            label="Availability"
            onChange={(e: SelectChangeEvent) => onAvailabilityChange(e.target.value)}
          >
            {AVAILABILITY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={FILTER_CONTROL_SX}>
          <InputLabel id="genre-filter-label">Genre</InputLabel>
          <Select
            labelId="genre-filter-label"
            id="genre-filter"
            multiple
            value={selectedGenres}
            label="Genre"
            onChange={(e: SelectChangeEvent<string[]>) =>
              onGenresChange(e.target.value as string[])
            }
          >
            {GENRE_OPTIONS.map((genre) => (
              <MenuItem key={genre} value={genre}>
                {genre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={FILTER_ROW_SX}>
        <FormControl sx={FILTER_CONTROL_SX}>
          <InputLabel id="rating-filter-label">Minimum Rating</InputLabel>
          <Select
            labelId="rating-filter-label"
            id="rating-filter"
            value={minRating}
            label="Minimum Rating"
            onChange={(e: SelectChangeEvent<number>) => onMinRatingChange(e.target.value as number)}
          >
            {RATING_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={FILTER_CONTROL_SX}>
          <InputLabel id="format-filter-label">Format</InputLabel>
          <Select
            labelId="format-filter-label"
            id="format-filter"
            multiple
            value={selectedFormats}
            label="Format"
            onChange={(e: SelectChangeEvent<string[]>) =>
              onFormatsChange(e.target.value as string[])
            }
          >
            {FORMAT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Autocomplete
          multiple
          fullWidth
          options={authors}
          loading={authorsLoading}
          disabled={authorsError}
          value={selectedAuthors}
          onChange={(_e, value) => onAuthorsChange(value)}
          getOptionLabel={(opt) => `${opt.last_name}, ${opt.first_name}`}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Author(s)"
              placeholder="Search authors..."
              helperText={authorsError ? 'Failed to load authors' : undefined}
            />
          )}
        />
      </Box>
      <FormControlLabel
        sx={{ mt: 1 }}
        control={
          <Checkbox
            checked={hideProfanity}
            onChange={(e) => onHideProfanityChange(e.target.checked)}
          />
        }
        label="Hide books with profanity"
      />
      <Typography variant="body2" color="text.secondary">
        Showing {filteredCount} of {totalCount} books
      </Typography>
      <ActiveFilterChips
        debouncedSearchTerm={debouncedSearchTerm}
        onClearSearch={onClearSearch}
        availabilityFilter={availabilityFilter}
        onAvailabilityChange={onAvailabilityChange}
        hideProfanity={hideProfanity}
        onHideProfanityChange={onHideProfanityChange}
        selectedGenres={selectedGenres}
        onGenresChange={onGenresChange}
        selectedFormats={selectedFormats}
        onFormatsChange={onFormatsChange}
        minRating={minRating}
        onMinRatingChange={onMinRatingChange}
        selectedAuthors={selectedAuthors}
        onAuthorsChange={onAuthorsChange}
        onClearAll={onClearAll}
        hasActiveFilters={!!hasActiveFilters}
      />
    </>
  );
}

export default BookSearchToolbar;
