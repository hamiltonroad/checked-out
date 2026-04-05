import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { Container, Typography, Paper, Alert, Box, Fade, Grid } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useBooks } from '../hooks/useBooks';
import { useAuthors } from '../hooks/useAuthors';
import { useBookFilters } from '../hooks/useBookFilters';
import { useAuth } from '../hooks/useAuth';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import type { Book } from '../types';
import BookDetailModal from '../components/BookDetailModal';
import EmptyState from '../components/EmptyState';
import BookCard from '../components/BookCard';
import BooksPageSkeleton from '../components/BooksPageSkeleton';
import BookSearchToolbar, { AVAILABILITY_FILTERS } from '../components/BookSearchToolbar';
import Pagination from '../components/Pagination';

/** BooksPage displays a list of books with server-side search, filtering, and pagination */
function BooksPage() {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const filters = useBookFilters();
  const { data, isLoading, error } = useBooks(filters.queryParams);
  const { data: authorsData, isLoading: authorsLoading, error: authorsError } = useAuthors();
  const { patron, isAuthenticated } = useAuth();
  const { data: wishlistEntries } = useWishlist(patron?.id);
  const addToWishlist = useAddToWishlist(patron?.id);
  const removeFromWishlist = useRemoveFromWishlist(patron?.id);

  const wishlistedBookIds = useMemo(() => {
    const ids = new Set<number>();
    wishlistEntries?.forEach((entry) => ids.add(entry.book_id));
    return ids;
  }, [wishlistEntries]);

  const authors = authorsData?.data?.authors || [];

  const handleWishlistToggle = useCallback(
    (bookId: number) => {
      if (wishlistedBookIds.has(bookId)) {
        removeFromWishlist.mutate(bookId);
      } else {
        addToWishlist.mutate(bookId);
      }
    },
    [wishlistedBookIds, addToWishlist, removeFromWishlist]
  );

  const handleRowClick = (bookId: number) => {
    setSelectedBookId(bookId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBookId(null);
  };

  const { handleClearAll, searchInputRef } = filters;
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
  }, [handleClearAll, searchInputRef]);

  const pagination = data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };
  const filteredBooks = useMemo(() => {
    const serverBooks = data?.data?.books || [];
    if (filters.availabilityFilter === AVAILABILITY_FILTERS.ALL) return serverBooks;
    return serverBooks.filter((book: Book) => book.status === filters.availabilityFilter);
  }, [data, filters.availabilityFilter]);

  if (isLoading) return <BooksPageSkeleton />;
  if (error) {
    return <Alert severity="error">Error loading books: {error.message || 'Unknown error'}</Alert>;
  }

  const hasFilters =
    filters.debouncedSearchTerm ||
    filters.availabilityFilter !== AVAILABILITY_FILTERS.ALL ||
    filters.selectedGenres.length > 0 ||
    filters.minRating > 0 ||
    filters.selectedAuthors.length > 0;

  const renderEmptyState = (): ReactNode => {
    let icon: ReactNode, title: string, message: string;
    if (hasFilters) {
      icon = <SearchOffIcon sx={{ fontSize: 'inherit' }} />;
      title = 'No matching books found';
      message = 'No books match your current filters. Try adjusting or clearing filters.';
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
            searchTerm={filters.searchTerm}
            onSearchChange={filters.setSearchTerm}
            searchInputRef={filters.searchInputRef}
            availabilityFilter={filters.availabilityFilter}
            onAvailabilityChange={filters.setAvailabilityFilter}
            hideProfanity={filters.hideProfanity}
            onHideProfanityChange={filters.setHideProfanity}
            onClearAll={filters.handleClearAll}
            filteredCount={filteredBooks.length}
            totalCount={pagination.total}
            debouncedSearchTerm={filters.debouncedSearchTerm}
            onClearSearch={filters.handleClearSearch}
            selectedGenres={filters.selectedGenres}
            onGenresChange={filters.setSelectedGenres}
            minRating={filters.minRating}
            onMinRatingChange={filters.setMinRating}
            selectedAuthors={filters.selectedAuthors}
            onAuthorsChange={filters.setSelectedAuthors}
            authors={authors}
            authorsLoading={authorsLoading}
            authorsError={!!authorsError}
          />
        </Paper>
      </Fade>
      {filteredBooks.length === 0 && renderEmptyState()}
      {filteredBooks.length > 0 && (
        <Fade in={!isLoading} timeout={500}>
          <Grid container spacing={2}>
            {filteredBooks.map((book) => (
              <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={book.id}>
                <BookCard
                  book={book}
                  onClick={handleRowClick}
                  isWishlisted={wishlistedBookIds.has(book.id)}
                  onWishlistToggle={isAuthenticated ? handleWishlistToggle : undefined}
                />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}
      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={filters.setPage}
        />
      )}
      <BookDetailModal open={modalOpen} onClose={handleModalClose} bookId={selectedBookId} />
    </Container>
  );
}

export default BooksPage;
