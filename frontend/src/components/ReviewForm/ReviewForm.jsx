import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Stack, CircularProgress, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import ReviewStars from '../ReviewStars/ReviewStars';

/**
 * ReviewForm allows users to create or edit book reviews
 * @param {Object} props - Component props
 * @param {number} props.bookId - ID of the book being reviewed
 * @param {number} props.initialRating - Initial rating for edit mode
 * @param {string} props.initialReviewText - Initial review text for edit mode
 * @param {function} props.onSubmit - Callback when form is submitted
 * @param {function} props.onCancel - Callback when form is cancelled
 * @param {boolean} props.isEdit - Whether this is edit mode
 * @param {boolean} props.isLoading - Whether the form is submitting
 */
function ReviewForm({
  bookId, // eslint-disable-line no-unused-vars
  initialRating = 0,
  initialReviewText = '',
  onSubmit,
  onCancel,
  isEdit = false,
  isLoading = false,
}) {
  const [rating, setRating] = useState(initialRating);
  const [reviewText, setReviewText] = useState(initialReviewText);
  const [error, setError] = useState('');

  useEffect(() => {
    setRating(initialRating);
    setReviewText(initialReviewText);
  }, [initialRating, initialReviewText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate rating
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }

    // Submit the review
    onSubmit({
      rating,
      reviewText: reviewText.trim() || null,
    });
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= 1000) {
      setReviewText(text);
    }
  };

  const characterCount = reviewText.length;
  const characterLimit = 1000;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" gutterBottom>
            Rating *
          </Typography>
          <ReviewStars rating={rating} onRatingChange={setRating} size="large" readOnly={false} />
          {rating === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Click to select a rating
            </Typography>
          )}
        </Box>

        <Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review (optional)"
            value={reviewText}
            onChange={handleTextChange}
            placeholder="Share your thoughts about this book..."
            helperText={`${characterCount}/${characterLimit} characters`}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || rating === 0}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {isLoading ? 'Submitting...' : isEdit ? 'Update Review' : 'Submit Review'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

ReviewForm.propTypes = {
  bookId: PropTypes.number.isRequired,
  initialRating: PropTypes.number,
  initialReviewText: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default ReviewForm;
