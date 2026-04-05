import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ratingService from '../services/ratingService';

/**
 * Custom hook to fetch rating statistics for a book
 * @param {number|null} bookId - Book ID to fetch stats for
 * @param {boolean} enabled - Whether the query should execute
 * @returns {UseQueryResult} React Query result with rating stats
 */
export function useBookRatingStats(bookId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['bookRatingStats', bookId],
    queryFn: () => ratingService.getBookRatingStats(bookId!),
    enabled: !!bookId && enabled,
  });
}

/**
 * Custom hook to fetch paginated ratings for a book
 * @param {number|null} bookId - Book ID to fetch ratings for
 * @param {number} page - Current page number (1-based)
 * @param {boolean} enabled - Whether the query should execute
 * @returns {UseQueryResult} React Query result with ratings data
 */
export function useBookRatings(bookId: number | null, page = 1, enabled = true) {
  return useQuery({
    queryKey: ['bookRatings', bookId, page],
    queryFn: () =>
      ratingService.getBookRatings(bookId!, {
        limit: 10,
        offset: (page - 1) * 10,
      }),
    enabled: !!bookId && enabled,
  });
}

/**
 * Custom hook to submit a rating for a book
 * @param {number|null} bookId - Book ID for cache invalidation
 * @returns {UseMutationResult} React Query mutation for submitting ratings
 */
export function useSubmitRating(bookId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ratingService.submitRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookRatings', bookId] });
      queryClient.invalidateQueries({ queryKey: ['bookRatingStats', bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
