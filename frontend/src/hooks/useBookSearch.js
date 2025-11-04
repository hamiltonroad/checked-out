import { useMemo } from 'react';

/**
 * Custom hook for filtering books by search term
 * Searches across book title, author first name, and author last name
 *
 * @param {Array} books - Array of book objects
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered array of books
 */
export function useBookSearch(books, searchTerm) {
  return useMemo(() => {
    if (!searchTerm) {
      return books;
    }

    const searchLower = searchTerm.toLowerCase();

    return books.filter((book) => {
      // Search in title
      if (book.title.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in authors
      if (book.authors && book.authors.length > 0) {
        return book.authors.some((author) => {
          const firstNameMatch = author.first_name?.toLowerCase().includes(searchLower);
          const lastNameMatch = author.last_name?.toLowerCase().includes(searchLower);
          return firstNameMatch || lastNameMatch;
        });
      }

      return false;
    });
  }, [books, searchTerm]);
}
