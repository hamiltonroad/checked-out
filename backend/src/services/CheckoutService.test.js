import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupMockRequire } from '../test-utils/mockRequire.js';

const { require, injectMock } = setupMockRequire(import.meta.url);

// Build mock objects for the CJS module cache
const mockCheckout = {
  findAll: vi.fn(),
  findByPk: vi.fn(),
  update: vi.fn(),
};

const mockModels = {
  Checkout: mockCheckout,
  Patron: {},
  Copy: {},
  Book: {},
};

// Inject mock before loading the service
injectMock('../models', mockModels);

const checkoutService = require('./CheckoutService');
const ApiError = require('../utils/ApiError');
const { Checkout, Patron, Copy } = mockModels;

describe('CheckoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCheckouts', () => {
    it('should return all checkouts with patron name and book title', async () => {
      const mockCheckouts = [
        {
          id: 1,
          checkout_date: '2026-03-20T14:00:00.000Z',
          return_date: null,
          patron: { first_name: 'Jane', last_name: 'Smith' },
          copy: { book: { title: 'The Great Gatsby' } },
        },
        {
          id: 2,
          checkout_date: '2026-03-15T10:00:00.000Z',
          return_date: '2026-03-28T09:00:00.000Z',
          patron: { first_name: 'John', last_name: 'Doe' },
          copy: { book: { title: '1984' } },
        },
      ];

      Checkout.findAll.mockResolvedValue(mockCheckouts);

      const result = await checkoutService.getAllCheckouts();

      expect(result).toEqual([
        {
          id: 1,
          patronName: 'Jane Smith',
          bookTitle: 'The Great Gatsby',
          checkoutDate: '2026-03-20T14:00:00.000Z',
          returnDate: null,
        },
        {
          id: 2,
          patronName: 'John Doe',
          bookTitle: '1984',
          checkoutDate: '2026-03-15T10:00:00.000Z',
          returnDate: '2026-03-28T09:00:00.000Z',
        },
      ]);
      expect(Checkout.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ model: Patron, as: 'patron' }),
            expect.objectContaining({ model: Copy, as: 'copy' }),
          ]),
          order: [['created_at', 'DESC']],
        })
      );
    });

    it('should return empty array when no checkouts exist', async () => {
      Checkout.findAll.mockResolvedValue([]);

      const result = await checkoutService.getAllCheckouts();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      Checkout.findAll.mockRejectedValue(new Error('Database error'));

      await expect(checkoutService.getAllCheckouts()).rejects.toThrow('Database error');
    });
  });

  describe('returnCheckout', () => {
    it('should set return_date and return updated record for active checkout', async () => {
      const mockRecord = {
        id: 1,
        checkout_date: '2026-03-20T14:00:00.000Z',
        return_date: null,
        patron: { first_name: 'Jane', last_name: 'Smith' },
        copy: { book: { title: 'The Great Gatsby' } },
        reload: vi.fn(),
      };

      // After reload, return_date is set
      mockRecord.reload.mockImplementation(() => {
        mockRecord.return_date = '2026-04-01T10:30:00.000Z';
        return Promise.resolve();
      });

      Checkout.findByPk.mockResolvedValue(mockRecord);
      Checkout.update.mockResolvedValue([1]);

      const result = await checkoutService.returnCheckout(1);

      expect(result).toEqual({
        id: 1,
        patronName: 'Jane Smith',
        bookTitle: 'The Great Gatsby',
        checkoutDate: '2026-03-20T14:00:00.000Z',
        returnDate: '2026-04-01T10:30:00.000Z',
      });
      expect(Checkout.update).toHaveBeenCalledWith(
        { return_date: expect.any(Date) },
        { where: { id: 1, return_date: null } }
      );
    });

    it('should throw NotFound error when checkout does not exist', async () => {
      Checkout.findByPk.mockResolvedValue(null);

      await expect(checkoutService.returnCheckout(999)).rejects.toThrow('Checkout not found');

      try {
        await checkoutService.returnCheckout(999);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(404);
      }
    });

    it('should throw Conflict error when checkout is already returned', async () => {
      const mockRecord = {
        id: 1,
        return_date: '2026-03-28T09:00:00.000Z',
        patron: { first_name: 'Jane', last_name: 'Smith' },
        copy: { book: { title: 'The Great Gatsby' } },
      };

      Checkout.findByPk.mockResolvedValue(mockRecord);

      await expect(checkoutService.returnCheckout(1)).rejects.toThrow(
        'Checkout has already been returned'
      );

      try {
        await checkoutService.returnCheckout(1);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(409);
      }
    });

    it('should throw Conflict error on concurrent return (zero rows updated)', async () => {
      const mockRecord = {
        id: 1,
        return_date: null,
        patron: { first_name: 'Jane', last_name: 'Smith' },
        copy: { book: { title: 'The Great Gatsby' } },
      };

      Checkout.findByPk.mockResolvedValue(mockRecord);
      Checkout.update.mockResolvedValue([0]);

      await expect(checkoutService.returnCheckout(1)).rejects.toThrow(
        'Checkout has already been returned'
      );
    });
  });
});
