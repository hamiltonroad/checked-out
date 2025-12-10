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
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useBook } from '../../hooks/useBook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusChip from '../StatusChip';
import SkeletonField from '../SkeletonField';
import ProfanityWarning from '../ProfanityWarning';
import { RatingDisplay, RatingInput, ReviewsList, RatingStats } from '../Rating';
import ratingService from '../../services/ratingService';
import CheckoutDialog from '../CheckoutDialog';

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
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  const { data, isLoading, error } = useBook(bookId);
  const book = data?.data;

  // Fetch ratings and reviews
  const {
    data: ratingsData,
    isLoading: ratingsLoading,
    error: ratingsError,
  } = useQuery({
    queryKey: ['bookRatings', bookId, reviewPage],
    queryFn: async () => {
      const result = await ratingService.getBookRatings(bookId, {
        limit: 10,
        offset: (reviewPage - 1) * 10,
      });
      return result;
    },
    enabled: !!bookId && open && tabValue === 1,
  });

  // Fetch rating stats
  const { data: statsData } = useQuery({
    queryKey: ['bookRatingStats', bookId],
    queryFn: () => ratingService.getBookRatingStats(bookId),
    enabled: !!bookId && open,
  });

  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: ratingService.submitRating,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookRatings', bookId]);
      queryClient.invalidateQueries(['bookRatingStats', bookId]);
      queryClient.invalidateQueries(['books']); // Refresh book list
      setShowRatingInput(false);
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePageChange = (event, page) => {
    setReviewPage(page);
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
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
        <Tab label="Details" />
        <Tab label="Reviews" />
      </Tabs>
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

        {/* Details Tab */}
        {tabValue === 0 && book && (
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

              <DetailField label="Rating">
                <RatingDisplay
                  rating={book.average_rating || statsData?.average_rating}
                  totalRatings={book.total_ratings || statsData?.total_ratings}
                  size="medium"
                  showCount
                />
              </DetailField>

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

        {/* Reviews Tab */}
        {tabValue === 1 && book && (
          <Box sx={{ pt: 2 }}>
            {ratingsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading reviews: {ratingsError.message || 'Unknown error'}
              </Alert>
            )}

            {statsData && (
              <Box sx={{ mb: 3 }}>
                <RatingStats stats={statsData} />
              </Box>
            )}

            <ReviewsList
              reviews={ratingsData?.ratings}
              isLoading={ratingsLoading}
              totalReviews={ratingsData?.stats?.total_ratings || 0}
              currentPage={reviewPage}
              onPageChange={handlePageChange}
            />
          </Box>
        )}

        {/* Rating Input Dialog */}
        {showRatingInput && book && (
          <RatingInput
            bookId={bookId}
            bookTitle={book.title}
            existingRating={null} // TODO: Fetch user's existing rating
            onSubmit={submitRatingMutation.mutate}
            onClose={() => setShowRatingInput(false)}
          />
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        {book && (
          <>
            <Button
              onClick={() => setCheckoutDialogOpen(true)}
              startIcon={<CheckCircleIcon />}
              variant="contained"
            >
              Check Out
            </Button>
            <Button
              onClick={() => setShowRatingInput(true)}
              startIcon={<StarIcon />}
              variant="outlined"
            >
              Rate this Book
            </Button>
          </>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {book && (
        <CheckoutDialog
          open={checkoutDialogOpen}
          onClose={() => setCheckoutDialogOpen(false)}
          bookTitle={book.title}
        />
      )}
    </Dialog>
  );
}

BookDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.number,
};

export default BookDetailModal;
