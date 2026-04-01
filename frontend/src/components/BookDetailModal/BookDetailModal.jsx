import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  useMediaQuery,
  useTheme,
  Skeleton,
  Slide,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useBook } from '../../hooks/useBook';
import { useCheckout } from '../../hooks/useCheckout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SkeletonField from '../SkeletonField';
import { RatingInput } from '../Rating';
import CheckoutDialog from '../CheckoutDialog';
import ratingService from '../../services/ratingService';
import BookDetailsTab from './BookDetailsTab';
import BookReviewsTab from './BookReviewsTab';

/** Transition component for slide-up animation */
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/** BookDetailModal displays detailed information about a book in a modal dialog */
function BookDetailModal({ open, onClose, bookId }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const { data, isLoading, error } = useBook(bookId);
  const checkoutMutation = useCheckout();
  const book = data?.data;

  const { data: statsData } = useQuery({
    queryKey: ['bookRatingStats', bookId],
    queryFn: () => ratingService.getBookRatingStats(bookId),
    enabled: !!bookId && open,
  });

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

  const handleCheckoutSubmit = async (checkoutData) => {
    try {
      await checkoutMutation.mutateAsync(checkoutData);
      setCheckoutOpen(false);
      setCheckoutSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['books', bookId] });
    } catch {
      // Error is captured by mutation state and displayed in dialog
    }
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
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        {tabValue === 0 && book && <BookDetailsTab book={book} statsData={statsData} />}
        {tabValue === 1 && book && <BookReviewsTab bookId={bookId} open={open} />}
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
          <Button
            onClick={() => setCheckoutOpen(true)}
            startIcon={<LibraryBooksIcon />}
            variant="contained"
          >
            Check Out
          </Button>
        )}
        {book && (
          <Button
            onClick={() => setShowRatingInput(true)}
            startIcon={<StarIcon />}
            variant="outlined"
          >
            Rate this Book
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          checkoutMutation.reset();
        }}
        onSubmit={handleCheckoutSubmit}
        isSubmitting={checkoutMutation.isPending}
        error={
          checkoutMutation.error?.response?.data?.message || checkoutMutation.error?.message || null
        }
      />
      <Snackbar
        open={checkoutSuccess}
        autoHideDuration={4000}
        onClose={() => setCheckoutSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setCheckoutSuccess(false)}>
          Book checked out successfully!
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

BookDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.number,
};

export default BookDetailModal;
