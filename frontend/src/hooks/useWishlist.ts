import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wishlistService from '../services/wishlistService';
import type { WishlistEntry } from '../types';

/**
 * Hook for fetching a patron's wishlist
 */
export function useWishlist(patronId: number | undefined) {
  return useQuery({
    queryKey: ['wishlist', patronId],
    queryFn: () => wishlistService.getWishlist(patronId!),
    enabled: Boolean(patronId),
  });
}

/**
 * Hook for adding a book to the wishlist with optimistic update
 */
export function useAddToWishlist(patronId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: number) => wishlistService.addToWishlist(bookId),
    onMutate: async (bookId: number) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', patronId] });

      const previous = queryClient.getQueryData<WishlistEntry[]>(['wishlist', patronId]);

      queryClient.setQueryData<WishlistEntry[]>(['wishlist', patronId], (old = []) => [
        ...old,
        {
          id: -1,
          patron_id: patronId!,
          book_id: bookId,
          created_at: new Date().toISOString(),
        } as WishlistEntry,
      ]);

      return { previous };
    },
    onError: (_err, _bookId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['wishlist', patronId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

/**
 * Hook for removing a book from the wishlist with optimistic update
 */
export function useRemoveFromWishlist(patronId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: number) => wishlistService.removeFromWishlist(bookId),
    onMutate: async (bookId: number) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', patronId] });

      const previous = queryClient.getQueryData<WishlistEntry[]>(['wishlist', patronId]);

      queryClient.setQueryData<WishlistEntry[]>(['wishlist', patronId], (old = []) =>
        old.filter((entry) => entry.book_id !== bookId)
      );

      return { previous };
    },
    onError: (_err, _bookId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['wishlist', patronId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
