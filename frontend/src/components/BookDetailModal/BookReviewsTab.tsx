import type React from 'react';
import { useState } from 'react';
import { Alert, Box } from '@mui/material';
import { RatingStats, ReviewsList } from '../Rating';
import { useBookRatings, useBookRatingStats } from '../../hooks/useRatings';

interface BookReviewsTabProps {
  bookId: number;
  open: boolean;
}

/**
 * BookReviewsTab displays rating statistics and a paginated list of reviews for a book.
 */
function BookReviewsTab({ bookId, open }: BookReviewsTabProps) {
  const [reviewPage, setReviewPage] = useState(1);

  const {
    data: ratingsData,
    isLoading: ratingsLoading,
    error: ratingsError,
  } = useBookRatings(bookId, reviewPage, open);

  const { data: statsData } = useBookRatingStats(bookId, open);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setReviewPage(page);
  };

  return (
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
  );
}

export default BookReviewsTab;
