import { type ComponentProps, forwardRef, useState } from 'react';
import type React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  useMediaQuery,
  useTheme,
  Slide,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Snackbar,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useBook } from '../../hooks/useBook';
import { useCheckout } from '../../hooks/useCheckout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BookDetailSkeleton from './BookDetailSkeleton';
import { RatingInput } from '../Rating';
import CheckoutDialog from '../CheckoutDialog';
import ratingService from '../../services/ratingService';
import { formatApiError } from '../../utils/errorUtils';
import BookDetailsTab from './BookDetailsTab';
import BookReviewsTab from './BookReviewsTab';

interface BookDetailModalProps {
  open: boolean;
  onClose: () => void;
  bookId: number | null;
}

/** Transition component for slide-up animation */
const Transition = forwardRef(function Transition(
  props: ComponentProps<typeof Slide>,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/** BookDetailModal displays detailed information about a book in a modal dialog */
function BookDetailModal({ open, onClose, bookId }: BookDetailModalProps) {
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
    queryFn: () => ratingService.getBookRatingStats(bookId!),
    enabled: !!bookId && open,
  });

  const submitRatingMutation = useMutation({
    mutationFn: ratingService.submitRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookRatings', bookId] });
      queryClient.invalidateQueries({ queryKey: ['bookRatingStats', bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] }); // Refresh book list
      setShowRatingInput(false);
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
  const isNoCopies = !book?.copies || book.copies.length === 0;

  const handleCheckoutSubmit = async (checkoutData: { copy_id: number }) => {
    try {
      await checkoutMutation.mutateAsync(checkoutData);
      setCheckoutOpen(false);
      setCheckoutSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['books', bookId] });
      queryClient.invalidateQueries({ queryKey: ['copies', 'available', bookId] });
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
        {isLoading && <BookDetailSkeleton />}

        {error && (
          <Alert severity="error">Error loading book: {error.message || 'Unknown error'}</Alert>
        )}
        {tabValue === 0 && book && <BookDetailsTab book={book} statsData={statsData} />}
        {tabValue === 1 && book && bookId && <BookReviewsTab bookId={bookId} open={open} />}
        {showRatingInput && book && bookId && (
          <RatingInput
            bookId={bookId}
            bookTitle={book.title}
            existingRating={null}
            onSubmit={submitRatingMutation.mutateAsync}
            onClose={() => setShowRatingInput(false)}
          />
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        {book && (
          <Tooltip title={isNoCopies ? 'No copies available for checkout' : ''}>
            <span>
              <Button
                onClick={() => setCheckoutOpen(true)}
                startIcon={<LibraryBooksIcon />}
                variant="contained"
                disabled={isNoCopies}
              >
                Check Out
              </Button>
            </span>
          </Tooltip>
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
        bookId={bookId}
        isSubmitting={checkoutMutation.isPending}
        error={checkoutMutation.error ? formatApiError(checkoutMutation.error) : null}
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
export default BookDetailModal;
