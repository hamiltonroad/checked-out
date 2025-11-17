import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating as MuiRating,
  Divider,
  CircularProgress,
  Pagination,
  Avatar,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import { formatDistanceToNow } from 'date-fns';

/**
 * Component to display a list of reviews for a book
 */
function ReviewsList({ reviews, isLoading, totalReviews, currentPage, onPageChange }) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No reviews yet. Be the first to review this book!
        </Typography>
      </Box>
    );
  }

  const totalPages = Math.ceil(totalReviews / 10);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {reviews.map((review) => (
        <Card key={review.id} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {review.patron?.first_name} {review.patron?.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </Typography>
                </Box>
                <MuiRating
                  value={review.rating}
                  readOnly
                  size="small"
                  emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                />
                {review.review_text && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {review.review_text}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {totalPages > 1 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={onPageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
}

ReviewsList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      rating: PropTypes.number.isRequired,
      review_text: PropTypes.string,
      created_at: PropTypes.string.isRequired,
      patron: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
      }),
    })
  ),
  isLoading: PropTypes.bool,
  totalReviews: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
};

ReviewsList.defaultProps = {
  reviews: [],
  isLoading: false,
  totalReviews: 0,
  currentPage: 1,
  onPageChange: () => {},
};

export default ReviewsList;