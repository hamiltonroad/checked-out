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
 * DetailField displays a labeled field value in the book details
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string|number} [props.value] - Field value (if not using children)
 * @param {React.ReactNode} [props.children] - Custom field content
 */
function DetailField({ label, value, children }) {
  // Don't render if no value and no children
  if (!value && !children) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      {children || <Typography variant="body1">{value}</Typography>}
    </Box>
  );
}

DetailField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node,
};

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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 1 }}>
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

              <DetailField
                label="Author(s)"
                value={
                  book.authors && book.authors.length > 0
                    ? book.authors
                        .map((author) => `${author.first_name} ${author.last_name}`)
                        .join(', ')
                    : null
                }
              />

              <DetailField label="ISBN" value={book.isbn} />

              <DetailField label="Publisher" value={book.publisher} />

              <DetailField label="Publication Year" value={book.publication_year} />

              <DetailField label="Genre" value={book.genre} />

              <DetailField label="Status">
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip status={book.status || 'available'} size="medium" />
                </Box>
              </DetailField>
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
