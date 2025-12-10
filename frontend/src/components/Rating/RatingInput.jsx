import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

const labels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

/**
 * Input component for submitting book ratings and reviews
 */
function RatingInput({ bookId, bookTitle, existingRating, onSubmit, onClose }) {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hover, setHover] = useState(-1);
  const [reviewText, setReviewText] = useState(existingRating?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setReviewText(existingRating.review_text || '');
    }
  }, [existingRating]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        bookId,
        rating,
        reviewText: reviewText.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <Box>
            <Typography component="legend" gutterBottom>
              Your Rating *
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MuiRating
                value={rating}
                size="large"
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
                onChangeActive={(event, newHover) => {
                  setHover(newHover);
                }}
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
                icon={<StarIcon fontSize="inherit" />}
              />
              {rating !== null && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {labels[hover !== -1 ? hover : rating]}
                </Typography>
              )}
            </Box>
          </Box>

          <TextField
            label="Your Review (Optional)"
            multiline
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this book..."
            inputProps={{ maxLength: 2000 }}
            helperText={`${reviewText.length}/2000 characters`}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || rating === 0}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {existingRating ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RatingInput.propTypes = {
  bookId: PropTypes.number.isRequired,
  bookTitle: PropTypes.string.isRequired,
  existingRating: PropTypes.shape({
    rating: PropTypes.number,
    review_text: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

RatingInput.defaultProps = {
  existingRating: null,
};

export default RatingInput;