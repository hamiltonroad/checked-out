import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Skeleton,
  Slide,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useBook } from '../../hooks/useBook';
import StatusChip from '../StatusChip';
import SkeletonField from '../SkeletonField';

/**
 * Transition component for slide-up animation
 */
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * BookDetailModal displays detailed information about a book in a modal dialog
 */
function BookDetailModal({ open, onClose, bookId }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { data, isLoading, error } = useBook(bookId);

  const book = data?.data;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Book Details
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {isLoading && (
          <Box sx={{ pt: 1 }}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} width="80%" />
            <SkeletonField labelWidth="30%" valueWidth="60%" />
            <SkeletonField labelWidth="20%" valueWidth="50%" />
            <SkeletonField labelWidth="30%" valueWidth="40%" />
            <SkeletonField labelWidth="40%" valueWidth="25%" />
            <SkeletonField labelWidth="25%" valueWidth="35%" />
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="20%" />
              <Skeleton variant="rounded" width={100} height={24} />
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error">Error loading book: {error.message || 'Unknown error'}</Alert>
        )}

        {book && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ pt: 1 }}
          >
            <Box
              sx={{
                width: { xs: '100%', sm: '33%' },
                maxWidth: { xs: 200, sm: 'none' },
                mx: { xs: 'auto', sm: 0 },
              }}
            >
              <Box
                sx={{
                  aspectRatio: '2/3',
                  bgcolor: 'grey.200',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
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
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip status={book.status || 'available'} size="medium" />
                </Box>
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <Divider />
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
