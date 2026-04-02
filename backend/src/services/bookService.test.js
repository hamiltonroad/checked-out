import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'module';

// Create a CJS require function to work with the CJS source code
const require = createRequire(import.meta.url);

// Build mock objects that will be injected into the CJS module cache
const mockBook = {
  findAll: vi.fn(),
  findAndCountAll: vi.fn(),
  findByPk: vi.fn(),
};

const mockModels = {
  Book: mockBook,
  Author: { findAll: vi.fn() },
  Copy: {},
  Checkout: {},
  Rating: {},
  sequelize: { literal: vi.fn((sql) => sql) },
};

// Inject the mock into Node's require cache BEFORE loading the service
const modelsPath = require.resolve('../models');
require.cache[modelsPath] = {
  id: modelsPath,
  filename: modelsPath,
  loaded: true,
  exports: mockModels,
};

// Also mock sequelize Op for the service's import
const sequelizePath = require.resolve('sequelize');
const realSequelize = require('sequelize');
require.cache[sequelizePath] = {
  id: sequelizePath,
  filename: sequelizePath,
  loaded: true,
  exports: { ...realSequelize, Op: realSequelize.Op },
};

// NOW load the service - it will get our mocked models
const bookService = require('./bookService');
const { Book } = mockModels;

describe('BookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('should return books with pagination metadata', async () => {
      const mockBooks = [
        { id: 1, title: 'Book A', toJSON: () => ({ id: 1, title: 'Book A', copies: [] }) },
        { id: 2, title: 'Book B', toJSON: () => ({ id: 2, title: 'Book B', copies: [] }) },
      ];

      Book.findAndCountAll.mockResolvedValue({ count: 2, rows: mockBooks });

      const result = await bookService.getAllBooks();

      expect(result.books).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
      expect(Book.findAndCountAll).toHaveBeenCalledTimes(1);
    });

    it('should apply genre filter', async () => {
      Book.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await bookService.getAllBooks({ genre: 'Fiction' });

      expect(Book.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ genre: 'Fiction' }),
        })
      );
    });

    it('should apply profanity filter', async () => {
      Book.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await bookService.getAllBooks({ profanity: 'false' });

      expect(Book.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ has_profanity: false }),
        })
      );
    });

    it('should calculate pagination from page and limit', async () => {
      Book.findAndCountAll.mockResolvedValue({ count: 50, rows: [] });

      const result = await bookService.getAllBooks({ page: '3', limit: '10' });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
      expect(Book.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 20,
        })
      );
    });

    it('should handle empty results', async () => {
      Book.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const result = await bookService.getAllBooks();

      expect(result.books).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      Book.findAndCountAll.mockRejectedValue(dbError);

      await expect(bookService.getAllBooks()).rejects.toThrow('Database connection failed');
    });

    it('should order books by title ascending', async () => {
      Book.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await bookService.getAllBooks();

      expect(Book.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['title', 'ASC']],
        })
      );
    });
  });

  describe('getBookById', () => {
    it('should return a single book with authors', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        toJSON: () => ({
          id: 1,
          title: 'Test Book',
          copies: [],
          average_rating: null,
          total_ratings: 0,
        }),
      };

      Book.findByPk.mockResolvedValue(mockBook);

      const result = await bookService.getBookById(1);

      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Book');
      expect(Book.findByPk).toHaveBeenCalledTimes(1);
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

  describe('calculateBookStatus', () => {
    it('should return available when no copies exist', () => {
      expect(bookService.calculateBookStatus([])).toBe('available');
      expect(bookService.calculateBookStatus(null)).toBe('available');
      expect(bookService.calculateBookStatus(undefined)).toBe('available');
    });

    it('should return available when copy has no checkouts', () => {
      const copies = [{ checkouts: [] }];
      expect(bookService.calculateBookStatus(copies)).toBe('available');
    });

    it('should return available when all checkouts are returned', () => {
      const copies = [{ checkouts: [{ return_date: '2024-01-01' }] }];
      expect(bookService.calculateBookStatus(copies)).toBe('available');
    });

    it('should return checked_out when all copies have unreturned checkouts', () => {
      const copies = [{ checkouts: [{ return_date: null }] }];
      expect(bookService.calculateBookStatus(copies)).toBe('checked_out');
    });
  });
});
