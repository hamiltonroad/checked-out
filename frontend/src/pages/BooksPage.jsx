import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { useBooks } from '../hooks/useBooks';
import { useBookSearch } from '../hooks/useBookSearch';
import BookDetailModal from '../components/BookDetailModal';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';

// Availability filter constants
const AVAILABILITY_FILTERS = {
  ALL: 'all',
  AVAILABLE: 'available',
  CHECKED_OUT: 'checked_out',
};

const AVAILABILITY_FILTER_LABELS = {
  [AVAILABILITY_FILTERS.ALL]: 'All Books',
  [AVAILABILITY_FILTERS.AVAILABLE]: 'Available',
  [AVAILABILITY_FILTERS.CHECKED_OUT]: 'Checked Out',
};

/**
 * BooksPage displays a list of all books in a table format with search and availability filtering
 */
function BooksPage() {
  const { data, isLoading, error } = useBooks();
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState(AVAILABILITY_FILTERS.ALL);

  const handleRowClick = (bookId) => {
    setSelectedBookId(bookId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBookId(null);
  };

  // Debounce search term with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get books and filter by search term
  const books = data?.data || [];
  const searchFiltered = useBookSearch(books, debouncedSearchTerm);

  // Apply availability filter
  const filteredBooks = useMemo(() => {
    if (availabilityFilter === AVAILABILITY_FILTERS.ALL) {
      return searchFiltered;
    }
    return searchFiltered.filter((book) => book.status === availabilityFilter);
  }, [searchFiltered, availabilityFilter]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading books: {error.message || 'Unknown error'}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Books
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          label="Search Books"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')} aria-label="Clear search">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="availability-filter-label">Availability</InputLabel>
          <Select
            labelId="availability-filter-label"
            id="availability-filter"
            value={availabilityFilter}
            label="Availability"
            onChange={(e) => setAvailabilityFilter(e.target.value)}
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
      {filteredBooks.length === 0 &&
        (() => {
          // Determine which icon and message to show based on current state
          let icon, title, message;

          if (debouncedSearchTerm && availabilityFilter !== AVAILABILITY_FILTERS.ALL) {
            // Search + Filter active
            icon = <SearchOffIcon sx={{ fontSize: 'inherit' }} />;
            title = 'No matching books found';
            message = `No ${AVAILABILITY_FILTER_LABELS[availabilityFilter].toLowerCase()} books found matching "${debouncedSearchTerm}"`;
          } else if (debouncedSearchTerm) {
            // Search only
            icon = <SearchOffIcon sx={{ fontSize: 'inherit' }} />;
            title = 'No matching books found';
            message = `No books found matching "${debouncedSearchTerm}"`;
          } else if (availabilityFilter !== AVAILABILITY_FILTERS.ALL) {
            // Filter only
            icon = <FilterListOffIcon sx={{ fontSize: 'inherit' }} />;
            title = 'No books available';
            message = `No ${AVAILABILITY_FILTER_LABELS[availabilityFilter].toLowerCase()} books`;
          } else {
            // Empty library
            icon = <MenuBookIcon sx={{ fontSize: 'inherit' }} />;
            title = 'No books in the library yet';
            message = 'The library is empty. Books will appear here once they are added.';
          }

          return <EmptyState icon={icon} title={title} message={message} />;
        })()}
      {filteredBooks.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author(s)</TableCell>
                <TableCell>Availability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBooks.map((book) => {
                const authors = book.authors
                  .map((author) => `${author.first_name} ${author.last_name}`)
                  .join(', ');

                return (
                  <TableRow
                    key={book.id}
                    onClick={() => handleRowClick(book.id)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{authors}</TableCell>
                    <TableCell>
                      <StatusChip status={book.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <BookDetailModal open={modalOpen} onClose={handleModalClose} bookId={selectedBookId} />
    </Container>
  );
}

BooksPage.propTypes = {};

export default BooksPage;
