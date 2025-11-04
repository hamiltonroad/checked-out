import { useState, useMemo, useCallback, useEffect } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useBooks } from '../hooks/useBooks';
import BookDetailModal from '../components/BookDetailModal';

/**
 * BooksPage displays a list of all books in a table format
 */
function BooksPage() {
  const { data, isLoading, error } = useBooks();
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const handleRowClick = (bookId) => {
    setSelectedBookId(bookId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBookId(null);
  };

  // Create debounced update function
  const updateDebouncedSearch = useCallback((value) => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Update debounced term when searchTerm changes
  useEffect(() => {
    const cleanup = updateDebouncedSearch(searchTerm);
    return cleanup;
  }, [searchTerm, updateDebouncedSearch]);

  // Filter books with useMemo
  const filteredBooks = useMemo(() => {
    const books = data?.data || [];

    if (!debouncedSearchTerm) {
      return books;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();

    return books.filter((book) => {
      // Search in title
      if (book.title.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in authors
      if (book.authors && book.authors.length > 0) {
        return book.authors.some((author) => {
          const firstNameMatch = author.first_name?.toLowerCase().includes(searchLower);
          const lastNameMatch = author.last_name?.toLowerCase().includes(searchLower);
          return firstNameMatch || lastNameMatch;
        });
      }

      return false;
    });
  }, [data, debouncedSearchTerm]);

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
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
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
                <IconButton onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {filteredBooks.length === 0 && debouncedSearchTerm && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No books found matching &quot;{debouncedSearchTerm}&quot;
          </Typography>
        </Box>
      )}
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
                    {/* TODO: Replace with actual book.status when checkout feature is implemented */}
                    <TableCell>Available</TableCell>
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

export default BooksPage;
