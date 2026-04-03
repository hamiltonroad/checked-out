import type React from 'react';
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
import type { Rating } from '../../types';

interface ReviewsListProps {
  reviews?: Rating[];
  isLoading?: boolean;
  totalReviews?: number;
  currentPage?: number;
  onPageChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
}

/**
 * Component to display a list of reviews for a book
 */
function ReviewsList({
  reviews = [],
  isLoading = false,
  totalReviews = 0,
  currentPage = 1,
  onPageChange = () => {},
}: ReviewsListProps) {
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

export default ReviewsList;
