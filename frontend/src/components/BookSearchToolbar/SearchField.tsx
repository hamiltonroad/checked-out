import type { RefObject } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchFieldProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

/** Search field with clear button for book title search. */
function SearchField({ searchTerm, onSearchChange, searchInputRef }: SearchFieldProps) {
  return (
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
  );
}

export default SearchField;
