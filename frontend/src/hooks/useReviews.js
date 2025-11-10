import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reviewService from '../services/reviewService';

/**
 * Hook to fetch reviews for a book
 */
export function useReviews(bookId, options = {}) {
  return useQuery({
    queryKey: ['reviews', bookId, options],
    queryFn: () => reviewService.getReviewsByBook(bookId, options),
    enabled: !!bookId,
  });
}

/**
 * Hook to create a new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, ...reviewData }) => reviewService.createReview(bookId, reviewData),
    onSuccess: (data, variables) => {
      // Invalidate reviews for this book
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
      // Invalidate books to update average ratings
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

/**
 * Hook to update an existing review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      { reviewId, bookId, ...reviewData } // eslint-disable-line no-unused-vars
    ) => reviewService.updateReview(reviewId, reviewData),
    onSuccess: (data, variables) => {
      // Invalidate reviews for this book
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
      // Invalidate books to update average ratings
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

/**
 * Hook to delete a review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      { reviewId, patronId, bookId } // eslint-disable-line no-unused-vars
    ) => reviewService.deleteReview(reviewId, patronId),
    onSuccess: (data, variables) => {
      // Invalidate reviews for this book
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
      // Invalidate books to update average ratings
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}
