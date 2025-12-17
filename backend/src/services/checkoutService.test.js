const checkoutService = require('./checkoutService');
const { Checkout, Patron, Copy } = require('../models');

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
    it('should successfully create checkout with valid data', async () => {
      const mockPatron = {
        id: 1,
        card_number: 'P001',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockCopy = {
        id: 1,
        book_id: 1,
        format: 'physical',
        copy_number: 1,
      };

      const mockCheckout = {
        id: 1,
        patron_id: 1,
        copy_id: 1,
        checkout_date: new Date(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        return_date: null,
      };

      const mockCompleteCheckout = {
        ...mockCheckout,
        patron: mockPatron,
        copy: mockCopy,
      };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockResolvedValue(mockCheckout);
      Checkout.findByPk.mockResolvedValue(mockCompleteCheckout);

      const result = await checkoutService.createCheckout({
        patron_id: 1,
        copy_id: 1,
      });

      expect(result).toEqual(mockCompleteCheckout);
      expect(Patron.findByPk).toHaveBeenCalledWith(1);
      expect(Copy.findByPk).toHaveBeenCalledWith(1);
      expect(Checkout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patron_id: 1,
          copy_id: 1,
          return_date: null,
        })
      );
      expect(Checkout.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should calculate due_date as +14 days when not provided', async () => {
      const mockPatron = { id: 1 };
      const mockCopy = { id: 1 };
      const mockCheckout = { id: 1, patron_id: 1, copy_id: 1 };
      const mockCompleteCheckout = { ...mockCheckout, patron: mockPatron, copy: mockCopy };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockResolvedValue(mockCheckout);
      Checkout.findByPk.mockResolvedValue(mockCompleteCheckout);

      await checkoutService.createCheckout({
        patron_id: 1,
        copy_id: 1,
      });

      const createCall = Checkout.create.mock.calls[0][0];
      const checkoutDate = createCall.checkout_date;
      const dueDate = createCall.due_date;

      // Due date should be 14 days after checkout date
      const expectedDueDate = new Date(checkoutDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      expect(dueDate.getTime()).toBeCloseTo(expectedDueDate.getTime(), -3);
    });

    it('should use provided due_date if given', async () => {
      const mockPatron = { id: 1 };
      const mockCopy = { id: 1 };
      const mockCheckout = { id: 1, patron_id: 1, copy_id: 1 };
      const mockCompleteCheckout = { ...mockCheckout, patron: mockPatron, copy: mockCopy };

      const customDueDate = new Date('2025-12-31');

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockResolvedValue(mockCheckout);
      Checkout.findByPk.mockResolvedValue(mockCompleteCheckout);

      await checkoutService.createCheckout({
        patron_id: 1,
        copy_id: 1,
        due_date: customDueDate,
      });

      const createCall = Checkout.create.mock.calls[0][0];
      expect(createCall.due_date.getTime()).toBe(customDueDate.getTime());
    });

    it('should throw ApiError.notFound when patron does not exist', async () => {
      Patron.findByPk.mockResolvedValue(null);

      await expect(
        checkoutService.createCheckout({
          patron_id: 999,
          copy_id: 1,
        })
      ).rejects.toThrow('Patron with ID 999 not found');

      expect(Patron.findByPk).toHaveBeenCalledWith(999);
      expect(Copy.findByPk).not.toHaveBeenCalled();
      expect(Checkout.create).not.toHaveBeenCalled();
    });

    it('should throw ApiError.notFound when copy does not exist', async () => {
      const mockPatron = { id: 1 };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(null);

      await expect(
        checkoutService.createCheckout({
          patron_id: 1,
          copy_id: 999,
        })
      ).rejects.toThrow('Copy with ID 999 not found');

      expect(Patron.findByPk).toHaveBeenCalledWith(1);
      expect(Copy.findByPk).toHaveBeenCalledWith(999);
      expect(Checkout.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockPatron = { id: 1 };
      const mockCopy = { id: 1 };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        checkoutService.createCheckout({
          patron_id: 1,
          copy_id: 1,
        })
      ).rejects.toThrow('Database connection failed');

      expect(Checkout.create).toHaveBeenCalledTimes(1);
    });
  });
});
