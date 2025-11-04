import { useState } from 'react';
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
} from '@mui/material';
import { useBooks } from '../hooks/useBooks';
import BookDetailModal from '../components/BookDetailModal';

/**
 * BooksPage displays a list of all books in a table format
 */
function BooksPage() {
  const { data, isLoading, error } = useBooks();
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (bookId) => {
    setSelectedBookId(bookId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBookId(null);
  };

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

  const books = data?.data || [];

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Books
      </Typography>
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
            {books.map((book) => {
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
      <BookDetailModal open={modalOpen} onClose={handleModalClose} bookId={selectedBookId} />
    </Container>
  );
}

export default BooksPage;
