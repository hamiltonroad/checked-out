import { useQuery } from '@tanstack/react-query';
import bookService from '../services/bookService';

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: bookService.getAll,
  });
}
