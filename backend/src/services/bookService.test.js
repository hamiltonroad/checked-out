const bookService = require('./bookService');
const { Book, Author } = require('../models');
const ApiError = require('../utils/ApiError');

// Mock the models
jest.mock('../models', () => ({
  Book: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Author: {},
}));

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('should return all books with authors', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Book A',
          isbn: '1234567890',
          authors: [{ id: 1, first_name: 'John', last_name: 'Doe' }],
        },
        {
          id: 2,
          title: 'Book B',
          isbn: '0987654321',
          authors: [{ id: 2, first_name: 'Jane', last_name: 'Smith' }],
        },
      ];

      Book.findAll.mockResolvedValue(mockBooks);

      const result = await bookService.getAllBooks();

      expect(result).toEqual(mockBooks);
      expect(Book.findAll).toHaveBeenCalledTimes(1);
      expect(Book.findAll).toHaveBeenCalledWith({
        where: {},
        limit: 100,
        offset: 0,
        include: [
          {
            model: Author,
            as: 'authors',
            through: { attributes: [] },
          },
        ],
        order: [['title', 'ASC']],
      });
    });

    it('should order books by title ascending', async () => {
      const mockBooks = [
        { id: 1, title: 'A Book', authors: [] },
        { id: 2, title: 'B Book', authors: [] },
        { id: 3, title: 'C Book', authors: [] },
      ];

      Book.findAll.mockResolvedValue(mockBooks);

      const result = await bookService.getAllBooks();

      expect(result).toEqual(mockBooks);
      expect(Book.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['title', 'ASC']],
        })
      );
    });

    it('should handle empty results', async () => {
      Book.findAll.mockResolvedValue([]);

      const result = await bookService.getAllBooks();

      expect(result).toEqual([]);
      expect(Book.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      Book.findAll.mockRejectedValue(dbError);

      await expect(bookService.getAllBooks()).rejects.toThrow('Database connection failed');
      expect(Book.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBookById', () => {
    it('should return a single book with authors', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        isbn: '1234567890',
        publisher: 'Test Publisher',
        publication_year: 2023,
        genre: 'Fiction',
        authors: [
          { id: 1, first_name: 'John', last_name: 'Doe' },
          { id: 2, first_name: 'Jane', last_name: 'Smith' },
        ],
      };

      Book.findByPk.mockResolvedValue(mockBook);

      const result = await bookService.getBookById(1);

      expect(result).toEqual(mockBook);
      expect(Book.findByPk).toHaveBeenCalledTimes(1);
      expect(Book.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: Author,
            as: 'authors',
            through: { attributes: [] },
          },
        ],
      });
    });

    it('should throw ApiError.notFound when book does not exist', async () => {
      Book.findByPk.mockResolvedValue(null);

      await expect(bookService.getBookById(999)).rejects.toThrow('Book with ID 999 not found');
      expect(Book.findByPk).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      Book.findByPk.mockRejectedValue(dbError);

      await expect(bookService.getBookById(1)).rejects.toThrow('Database connection failed');
      expect(Book.findByPk).toHaveBeenCalledTimes(1);
    });
  });
});
