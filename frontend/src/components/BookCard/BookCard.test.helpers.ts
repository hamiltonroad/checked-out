import { vi } from 'vitest';

export const mockBook = {
  id: 1,
  title: 'The Great Gatsby',
  authors: [{ first_name: 'F. Scott', last_name: 'Fitzgerald' }],
  status: 'available',
  genre: 'Fiction',
  copies: [
    { id: 1, book_id: 1, format: 'physical', checkouts: [] },
    { id: 2, book_id: 1, format: 'kindle', checkouts: [] },
  ],
};

export const createMockOnClick = () => vi.fn();
