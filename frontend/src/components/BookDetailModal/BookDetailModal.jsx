import { forwardRef, useState } from 'react';
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
  Snackbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useBook } from '../../hooks/useBook';
import {
  useReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from '../../hooks/useReviews';
import StatusChip from '../StatusChip';
import SkeletonField from '../SkeletonField';
import ProfanityWarning from '../ProfanityWarning';
import ReviewStars from '../ReviewStars/ReviewStars';
import ReviewForm from '../ReviewForm/ReviewForm';
import ReviewList from '../ReviewList/ReviewList';

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
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews(bookId);
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // TODO: Replace with actual authenticated user ID when authentication is implemented
  const currentPatronId = 1; // Hardcoded for testing

  const book = data?.data;
  const reviews = reviewsData?.data?.reviews || [];

  // Check if current patron has already reviewed this book
  const currentPatronReview = reviews.find((review) => review.patron_id === currentPatronId);
  const hasReviewed = !!currentPatronReview;

  const handleSubmitReview = async (reviewData) => {
    try {
      if (editingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: editingReview.id,
          bookId,
          ...reviewData,
          patronId: currentPatronId, // Temporary until auth
        });
        setSnackbarMessage('Review updated successfully');
        setEditingReview(null);
      } else {
        await createReviewMutation.mutateAsync({
          bookId,
          ...reviewData,
          patronId: currentPatronId, // Temporary until auth
        });
        setSnackbarMessage('Review submitted successfully');
      }
      setShowReviewForm(false);
    } catch {
      setSnackbarMessage('Failed to submit review. Please try again.');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (review) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await deleteReviewMutation.mutateAsync({
          reviewId: review.id,
          patronId: currentPatronId, // Temporary until auth
          bookId,
        });
        setSnackbarMessage('Review deleted successfully');
      } catch {
        setSnackbarMessage('Failed to delete review. Please try again.');
      }
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">{book.title}</Typography>
                {book.has_profanity && <ProfanityWarning size="medium" />}
              </Box>

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

        {/* Reviews Section */}
        {book && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Reviews
              </Typography>

              {/* Average Rating */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <ReviewStars rating={book.averageRating || 0} size="large" readOnly />
                <Typography variant="body1">
                  {book.averageRating ? book.averageRating.toFixed(1) : '0.0'} out of 5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({book.reviewCount || 0} {book.reviewCount === 1 ? 'review' : 'reviews'})
                </Typography>
              </Stack>

              {/* Write Review Button */}
              {!showReviewForm && !hasReviewed && (
                <Button variant="outlined" onClick={() => setShowReviewForm(true)} sx={{ mb: 2 }}>
                  Write a Review
                </Button>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <Box sx={{ mb: 3 }}>
                  <ReviewForm
                    bookId={bookId}
                    initialRating={editingReview?.rating || 0}
                    initialReviewText={editingReview?.review_text || ''}
                    onSubmit={handleSubmitReview}
                    onCancel={handleCancelReview}
                    isEdit={!!editingReview}
                    isLoading={createReviewMutation.isPending || updateReviewMutation.isPending}
                  />
                </Box>
              )}

              {/* Reviews List */}
              <ReviewList
                reviews={reviews}
                currentPatronId={currentPatronId}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                loading={reviewsLoading}
              />
            </Box>
          </>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Dialog>
  );
}

BookDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.number,
};

export default BookDetailModal;
