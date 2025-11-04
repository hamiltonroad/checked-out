import { useQuery } from '@tanstack/react-query';
import bookService from '../services/bookService';

export function useBook(id) {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => bookService.getById(id),
    enabled: !!id,
  });
}
