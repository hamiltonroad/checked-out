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

/**
 * BooksPage displays a list of all books in a table format
 */
function BooksPage() {
  const { data, isLoading, error } = useBooks();

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
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{authors}</TableCell>
                  <TableCell>Available</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

BooksPage.propTypes = {};

export default BooksPage;
