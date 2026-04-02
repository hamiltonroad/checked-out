import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
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
import type { Book } from '../types';
import BookDetailModal from '../components/BookDetailModal';
import EmptyState from '../components/EmptyState';
import BookCard from '../components/BookCard';
import BooksPageSkeleton from '../components/BooksPageSkeleton';
import BookSearchToolbar, {
  AVAILABILITY_FILTERS,
  AVAILABILITY_FILTER_LABELS,
} from '../components/BookSearchToolbar';
import BooksTable from '../components/BooksTable';
import Pagination from '../components/Pagination';

/**
 * BooksPage displays a list of books with server-side search, filtering, and pagination
 */
function BooksPage() {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState(AVAILABILITY_FILTERS.ALL);
  const [hideProfanity, setHideProfanity] = useState(false);
  const [page, setPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, limit: 20 };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (hideProfanity) params.profanity = 'false';
    return params;
  }, [debouncedSearchTerm, hideProfanity, page]);

  const { data, isLoading, error } = useBooks(queryParams);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [hideProfanity]);

  const handleRowClick = (bookId: number) => {
    setSelectedBookId(bookId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBookId(null);
  };

  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setAvailabilityFilter(AVAILABILITY_FILTERS.ALL);
    setHideProfanity(false);
    setPage(1);
  }, []);

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') handleClearAll();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClearAll]);

  const pagination = data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };
  const filteredBooks = useMemo(() => {
    const serverBooks = data?.data?.books || [];
    if (availabilityFilter === AVAILABILITY_FILTERS.ALL) return serverBooks;
    return serverBooks.filter((book: Book) => book.status === availabilityFilter);
  }, [data, availabilityFilter]);

  if (isLoading) return <BooksPageSkeleton />;
  if (error) {
    return <Alert severity="error">Error loading books: {error.message || 'Unknown error'}</Alert>;
  }

  const renderEmptyState = (): ReactNode => {
    let icon: ReactNode, title: string, message: string;

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
            onHideProfanityChange={setHideProfanity}
            onClearAll={handleClearAll}
            filteredCount={filteredBooks.length}
            totalCount={pagination.total}
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
      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
      <BookDetailModal open={modalOpen} onClose={handleModalClose} bookId={selectedBookId} />
    </Container>
  );
}

export default BooksPage;
