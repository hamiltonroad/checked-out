import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Rating as MuiRating,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { formatApiError } from '../../utils/errorUtils';
import type { ExistingRating } from '../../types';

interface RatingInputProps {
  bookId: number;
  bookTitle: string;
  existingRating?: ExistingRating | null;
  onSubmit: (data: { bookId: number; rating: number; reviewText: string }) => Promise<void>;
  onClose: () => void;
}

interface RatingFormData {
  rating: number;
  reviewText: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const REVIEW_MAX_LENGTH = 2000;

/**
 * Input component for submitting book ratings and reviews
 */
function RatingInput({
  bookId,
  bookTitle,
  existingRating = null,
  onSubmit,
  onClose,
}: RatingInputProps) {
  const [hover, setHover] = useState(-1);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RatingFormData>({
    defaultValues: {
      rating: existingRating?.rating || 0,
      reviewText: existingRating?.review_text || '',
    },
  });

  const ratingValue = watch('rating');
  const reviewTextValue = watch('reviewText');

  useEffect(() => {
    if (existingRating) {
      reset({
        rating: existingRating.rating,
        reviewText: existingRating.review_text || '',
      });
    }
  }, [existingRating, reset]);

  const handleFormSubmit = async (data: RatingFormData) => {
    try {
      await onSubmit({
        bookId,
        rating: data.rating,
        reviewText: data.reviewText.trim(),
      });
      onClose();
    } catch (err) {
      setError('root', { message: formatApiError(err as Error, 'Failed to submit rating') });
    }
  };

  return (
    <Dialog open maxWidth="sm" fullWidth onClose={onClose}>
      <DialogTitle>
        {existingRating ? 'Update Your Rating' : 'Rate This Book'}
        <Typography variant="body2" color="text.secondary">
          {bookTitle}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {errors.root && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.root.message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <Box>
            <Typography component="legend" gutterBottom>
              Your Rating *
            </Typography>
            {errors.rating && (
              <Typography variant="caption" color="error">
                {errors.rating.message}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Controller
                name="rating"
                control={control}
                rules={{
                  validate: (value) => (value > 0 ? true : 'Please select a rating'),
                }}
                render={({ field: { onChange, value } }) => (
                  <MuiRating
                    value={value}
                    size="large"
                    onChange={(_event, newValue) => onChange(newValue)}
                    onChangeActive={(_event, newHover) => setHover(newHover)}
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    icon={<StarIcon fontSize="inherit" />}
                  />
                )}
              />
              {ratingValue !== null && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {RATING_LABELS[hover !== -1 ? hover : ratingValue]}
                </Typography>
              )}
            </Box>
          </Box>

          <TextField
            label="Your Review (Optional)"
            multiline
            rows={4}
            placeholder="Share your thoughts about this book..."
            inputProps={{ maxLength: REVIEW_MAX_LENGTH }}
            helperText={`${reviewTextValue.length}/${REVIEW_MAX_LENGTH} characters`}
            fullWidth
            {...register('reviewText')}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isSubmitting || ratingValue === 0}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {existingRating ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RatingInput;
