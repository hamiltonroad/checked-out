import {
  TextField,
  InputAdornment,
  IconButton,
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
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {
  AVAILABILITY_FILTERS,
  AVAILABILITY_FILTER_LABELS,
  GENRE_OPTIONS,
  RATING_FILTER_OPTIONS,
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
    minRating > 0 ||
    selectedAuthors.length > 0;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 1.5 }}>
        <TextField
          fullWidth
          label="Search by Title"
          placeholder="Search by title..."
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
            onChange={(e: SelectChangeEvent) => onAvailabilityChange(e.target.value)}
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
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 1.5 }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
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
      <Box sx={{ mt: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={hideProfanity}
              onChange={(e) => onHideProfanityChange(e.target.checked)}
            />
          }
          label="Hide books with profanity"
        />
      </Box>
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
