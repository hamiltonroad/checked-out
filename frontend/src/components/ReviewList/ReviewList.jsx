import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Skeleton,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ReviewStars from '../ReviewStars/ReviewStars';
import EmptyState from '../EmptyState/EmptyState';

/**
 * ReviewList displays a list of book reviews
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Array of review objects
 * @param {number} props.currentPatronId - ID of current patron (for edit/delete permissions)
 * @param {function} props.onEdit - Callback when edit is clicked
 * @param {function} props.onDelete - Callback when delete is clicked
 * @param {boolean} props.loading - Whether reviews are loading
 */
function ReviewList({ reviews = [], currentPatronId, onEdit, onDelete, loading = false }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleMenuOpen = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const handleEdit = () => {
    if (selectedReview && onEdit) {
      onEdit(selectedReview);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedReview && onDelete) {
      onDelete(selectedReview);
    }
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Skeleton variant="text" width="150px" />
                <Skeleton variant="text" width="100px" />
                <Skeleton variant="rectangular" height={60} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState title="No Reviews Yet" subtitle="Be the first to review this book!" icon="star" />
    );
  }

  return (
    <Stack spacing={2}>
      {reviews.map((review) => {
        const isOwner = currentPatronId && review.patron_id === currentPatronId;
        const patronName = review.patron
          ? `${review.patron.first_name} ${review.patron.last_name}`
          : 'Anonymous';

        return (
          <Card key={review.id} variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {patronName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(review.created_at)}
                    </Typography>
                  </Box>
                  {isOwner && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, review)}
                      aria-label="Review options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>

                <ReviewStars rating={review.rating} size="small" readOnly />

                {review.review_text && (
                  <Typography variant="body2" color="text.primary">
                    {review.review_text}
                  </Typography>
                )}

                {review.updated_at && review.updated_at !== review.created_at && (
                  <Typography variant="caption" color="text.secondary" fontStyle="italic">
                    Edited on {formatDate(review.updated_at)}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        );
      })}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Review
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Review
        </MenuItem>
      </Menu>
    </Stack>
  );
}

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      patron_id: PropTypes.number.isRequired,
      rating: PropTypes.number.isRequired,
      review_text: PropTypes.string,
      created_at: PropTypes.string.isRequired,
      updated_at: PropTypes.string,
      patron: PropTypes.shape({
        first_name: PropTypes.string.isRequired,
        last_name: PropTypes.string.isRequired,
      }),
    })
  ),
  currentPatronId: PropTypes.number,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  loading: PropTypes.bool,
};

export default ReviewList;
