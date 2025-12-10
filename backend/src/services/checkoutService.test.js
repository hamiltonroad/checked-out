const checkoutService = require('./checkoutService');
const { Checkout, Patron, Copy } = require('../models');
const ApiError = require('../utils/ApiError');

// Mock the models
jest.mock('../models', () => ({
  Checkout: {
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  Patron: {
    findByPk: jest.fn(),
  },
  Copy: {
    findByPk: jest.fn(),
  },
}));

describe('CheckoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckout', () => {
    it('should create a checkout successfully', async () => {
      const patronId = 1;
      const copyId = 2;
      const mockPatron = { id: 1, first_name: 'John', last_name: 'Doe' };
      const mockCopy = { id: 2, book_id: 1, format: 'physical' };
      const mockCheckout = {
        id: 1,
        patron_id: patronId,
        copy_id: copyId,
        checkout_date: new Date(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        return_date: null,
      };
      const mockCheckoutWithAssociations = {
        ...mockCheckout,
        patron: mockPatron,
        copy: mockCopy,
      };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockResolvedValue(mockCheckout);
      Checkout.findByPk.mockResolvedValue(mockCheckoutWithAssociations);

      const result = await checkoutService.createCheckout(patronId, copyId);

      expect(Patron.findByPk).toHaveBeenCalledWith(patronId);
      expect(Copy.findByPk).toHaveBeenCalledWith(copyId);
      expect(Checkout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patron_id: patronId,
          copy_id: copyId,
          return_date: null,
        })
      );
      expect(Checkout.findByPk).toHaveBeenCalledWith(mockCheckout.id, {
        include: [
          {
            model: Patron,
            as: 'patron',
          },
          {
            model: Copy,
            as: 'copy',
          },
        ],
      });
      expect(result).toEqual(mockCheckoutWithAssociations);
    });

    it('should throw 404 error when patron not found', async () => {
      const patronId = 999;
      const copyId = 2;

      Patron.findByPk.mockResolvedValue(null);

      await expect(checkoutService.createCheckout(patronId, copyId)).rejects.toThrow(
        ApiError.notFound(`Patron with ID ${patronId} not found`)
      );

      expect(Patron.findByPk).toHaveBeenCalledWith(patronId);
      expect(Copy.findByPk).not.toHaveBeenCalled();
      expect(Checkout.create).not.toHaveBeenCalled();
    });

    it('should throw 404 error when copy not found', async () => {
      const patronId = 1;
      const copyId = 999;
      const mockPatron = { id: 1, first_name: 'John', last_name: 'Doe' };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(null);

      await expect(checkoutService.createCheckout(patronId, copyId)).rejects.toThrow(
        ApiError.notFound(`Copy with ID ${copyId} not found`)
      );

      expect(Patron.findByPk).toHaveBeenCalledWith(patronId);
      expect(Copy.findByPk).toHaveBeenCalledWith(copyId);
      expect(Checkout.create).not.toHaveBeenCalled();
    });

    it('should calculate due date as 14 days from now', async () => {
      const patronId = 1;
      const copyId = 2;
      const mockPatron = { id: 1 };
      const mockCopy = { id: 2 };
      const mockCheckout = { id: 1 };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockResolvedValue(mockCheckout);
      Checkout.findByPk.mockResolvedValue(mockCheckout);

      await checkoutService.createCheckout(patronId, copyId);

      const createCall = Checkout.create.mock.calls[0][0];
      const checkoutDate = new Date(createCall.checkout_date);
      const dueDate = new Date(createCall.due_date);
      const daysDiff = Math.round((dueDate - checkoutDate) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBe(14);
      expect(createCall.return_date).toBeNull();
    });

    it('should handle database errors', async () => {
      const patronId = 1;
      const copyId = 2;
      const dbError = new Error('Database connection failed');

      Patron.findByPk.mockRejectedValue(dbError);

      await expect(checkoutService.createCheckout(patronId, copyId)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
