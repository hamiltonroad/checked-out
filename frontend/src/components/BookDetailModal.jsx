import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useBook } from '../hooks/useBook';

/**
 * BookDetailModal displays detailed information about a book in a modal dialog
 */
function BookDetailModal({ open, onClose, bookId }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { data, isLoading, error } = useBook(bookId);

  const book = data?.data;

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle>Book Details</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">Error loading book: {error.message || 'Unknown error'}</Alert>
        )}

        {book && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="h5" gutterBottom>
              {book.title}
            </Typography>

            {book.authors && book.authors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Author(s)
                </Typography>
                <Typography variant="body1">
                  {book.authors
                    .map((author) => `${author.first_name} ${author.last_name}`)
                    .join(', ')}
                </Typography>
              </Box>
            )}

            {book.isbn && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  ISBN
                </Typography>
                <Typography variant="body1">{book.isbn}</Typography>
              </Box>
            )}

            {book.publisher && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Publisher
                </Typography>
                <Typography variant="body1">{book.publisher}</Typography>
              </Box>
            )}

            {book.publication_year && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Publication Year
                </Typography>
                <Typography variant="body1">{book.publication_year}</Typography>
              </Box>
            )}

            {book.genre && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Genre
                </Typography>
                <Typography variant="body1">{book.genre}</Typography>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1">{book.status || 'Available'}</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

BookDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.number,
};

export default BookDetailModal;
