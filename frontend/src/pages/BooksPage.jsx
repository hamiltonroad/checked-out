import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Alert,
  Box,
  Fade,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { useBooks } from '../hooks/useBooks';
import { useBookSearch } from '../hooks/useBookSearch';
import BookDetailModal from '../components/BookDetailModal';
import EmptyState from '../components/EmptyState';
import BookCard from '../components/BookCard';
import BooksPageSkeleton from '../components/BooksPageSkeleton';
import BookSearchToolbar, {
  AVAILABILITY_FILTERS,
  AVAILABILITY_FILTER_LABELS,
} from '../components/BookSearchToolbar';
import BooksTable from '../components/BooksTable';

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
  const [hideProfanity, setHideProfanity] = useState(false);
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

  const handleClearAll = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setAvailabilityFilter(AVAILABILITY_FILTERS.ALL);
    setHideProfanity(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') handleClearAll();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get books and filter by search term
  const books = data?.data || [];
  const searchFiltered = useBookSearch(books, debouncedSearchTerm);

  // Apply availability and profanity filters
  const filteredBooks = useMemo(() => {
    let filtered = searchFiltered;

    if (availabilityFilter !== AVAILABILITY_FILTERS.ALL) {
      filtered = filtered.filter((book) => book.status === availabilityFilter);
    }

    if (hideProfanity) {
      filtered = filtered.filter((book) => !book.has_profanity);
    }

    return filtered;
  }, [searchFiltered, availabilityFilter, hideProfanity]);

  if (isLoading) {
    return <BooksPageSkeleton />;
  }

  if (error) {
    return <Alert severity="error">Error loading books: {error.message || 'Unknown error'}</Alert>;
  }

  // Determine empty state content
  const renderEmptyState = () => {
    let icon, title, message;

    if (debouncedSearchTerm && availabilityFilter !== AVAILABILITY_FILTERS.ALL) {
      icon = <SearchOffIcon sx={{ fontSize: 'inherit' }} />;
      title = 'No matching books found';
      message = `No ${AVAILABILITY_FILTER_LABELS[availabilityFilter].toLowerCase()} books found matching "${debouncedSearchTerm}"`;
    } else if (debouncedSearchTerm) {
      icon = <SearchOffIcon sx={{ fontSize: 'inherit' }} />;
      title = 'No matching books found';
      message = `No books found matching "${debouncedSearchTerm}"`;
    } else if (availabilityFilter !== AVAILABILITY_FILTERS.ALL) {
      icon = <FilterListOffIcon sx={{ fontSize: 'inherit' }} />;
      title = 'No books available';
      message = `No ${AVAILABILITY_FILTER_LABELS[availabilityFilter].toLowerCase()} books`;
    } else {
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
  };

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
          <BookSearchToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchInputRef={searchInputRef}
            availabilityFilter={availabilityFilter}
            onAvailabilityChange={setAvailabilityFilter}
            hideProfanity={hideProfanity}
            onHideProfanityChange={(e) => setHideProfanity(e.target.checked)}
            onClearAll={handleClearAll}
            filteredCount={filteredBooks.length}
            totalCount={books.length}
            debouncedSearchTerm={debouncedSearchTerm}
            onClearSearch={handleClearSearch}
          />
        </Paper>
      </Fade>
      {filteredBooks.length === 0 && renderEmptyState()}
      {filteredBooks.length > 0 && !isMobile && (
        <Fade in={!isLoading} timeout={500}>
          <div>
            <BooksTable books={filteredBooks} onRowClick={handleRowClick} />
          </div>
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

export default BooksPage;
