import { useState, useEffect, useMemo, useRef } from 'react';
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
  Alert,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Chip,
  Button,
  Fade,
  Stack,
  useMediaQuery,
  useTheme,
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
import BookCard from '../components/BookCard';

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
  const searchInputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape to clear search and reset filter
      if (event.key === 'Escape') {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setAvailabilityFilter(AVAILABILITY_FILTERS.ALL);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      <Container>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Books
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and search our library collection
          </Typography>
        </Box>
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: 'flex-start',
              mb: 1.5,
            }}
          >
            <Skeleton
              variant="rounded"
              height={56}
              sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}
            />
            <Skeleton variant="rounded" height={56} sx={{ width: { xs: '100%', sm: 200 } }} />
          </Box>
          <Skeleton variant="text" width={150} />
        </Paper>
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
              {[...Array(6)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="40%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" width={100} height={24} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading books: {error.message || 'Unknown error'}</Alert>;
  }

  return (
    <Container>
      <Fade in={!isLoading} timeout={300}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Books
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and search our library collection
          </Typography>
        </Box>
      </Fade>
      <Fade in={!isLoading} timeout={400}>
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              inputRef={searchInputRef}
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
            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
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
          <Typography variant="body2" color="text.secondary">
            Showing {filteredBooks.length} of {books.length} books
          </Typography>
          {(debouncedSearchTerm || availabilityFilter !== AVAILABILITY_FILTERS.ALL) && (
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
                  onDelete={() => {
                    setSearchTerm('');
                    setDebouncedSearchTerm('');
                  }}
                  size="small"
                  variant="outlined"
                  aria-label={`Remove search filter: ${debouncedSearchTerm}`}
                />
              )}
              {availabilityFilter !== AVAILABILITY_FILTERS.ALL && (
                <Chip
                  label={`Availability: ${AVAILABILITY_FILTER_LABELS[availabilityFilter]}`}
                  onDelete={() => setAvailabilityFilter(AVAILABILITY_FILTERS.ALL)}
                  size="small"
                  variant="outlined"
                  aria-label={`Remove availability filter: ${AVAILABILITY_FILTER_LABELS[availabilityFilter]}`}
                />
              )}
              {debouncedSearchTerm && availabilityFilter !== AVAILABILITY_FILTERS.ALL && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchTerm('');
                    setDebouncedSearchTerm('');
                    setAvailabilityFilter(AVAILABILITY_FILTERS.ALL);
                  }}
                  sx={{ ml: 0.5 }}
                  aria-label="Clear all filters"
                >
                  Clear all filters
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Fade>
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

          return (
            <Fade in={!isLoading} timeout={500}>
              <div>
                <EmptyState icon={icon} title={title} message={message} />
              </div>
            </Fade>
          );
        })()}
      {filteredBooks.length > 0 && !isMobile && (
        <Fade in={!isLoading} timeout={500}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Author(s)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBooks.map((book, index) => {
                  const authors = book.authors
                    .map((author) => `${author.first_name} ${author.last_name}`)
                    .join(', ');
                  const isLastRow = index === filteredBooks.length - 1;
                  const tableCellSx = {
                    borderBottom: isLastRow ? 'none' : '1px solid',
                    borderColor: 'divider',
                  };

                  return (
                    <TableRow
                      key={book.id}
                      onClick={() => handleRowClick(book.id)}
                      sx={{
                        cursor: 'pointer',
                        transition: (theme) =>
                          theme.transitions.create(['background-color'], {
                            duration: theme.transitions.duration.short,
                          }),
                        '@media (prefers-reduced-motion: reduce)': {
                          transition: 'none',
                        },
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell sx={tableCellSx}>{book.title}</TableCell>
                      <TableCell sx={tableCellSx}>{authors}</TableCell>
                      <TableCell sx={tableCellSx}>
                        <StatusChip status={book.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
      )}
      {filteredBooks.length > 0 && isMobile && (
        <Fade in={!isLoading} timeout={500}>
          <Stack spacing={2}>
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onClick={handleRowClick} />
            ))}
          </Stack>
        </Fade>
      )}
      <BookDetailModal open={modalOpen} onClose={handleModalClose} bookId={selectedBookId} />
    </Container>
  );
}

BooksPage.propTypes = {};

export default BooksPage;
