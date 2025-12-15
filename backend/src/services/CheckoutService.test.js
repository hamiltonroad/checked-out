const CheckoutService = require('./CheckoutService');
const { Checkout, Patron, Copy } = require('../models');

// Mock the models
jest.mock('../models', () => ({
  Checkout: {
    create: jest.fn(),
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
    it('should create a checkout with valid patron and copy', async () => {
      const mockPatron = { id: 1, card_number: 'P001' };
      const mockCopy = { id: 1, book_id: 1, format: 'Hardcover' };
      const mockCheckout = {
        id: 1,
        copy_id: 1,
        patron_id: 1,
        checkout_date: new Date('2024-01-01'),
        due_date: new Date('2024-01-15'),
      };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockResolvedValue(mockCheckout);

      const result = await CheckoutService.createCheckout({
        copyId: 1,
        patronId: 1,
        checkoutDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
      });

      expect(result).toEqual(mockCheckout);
      expect(Patron.findByPk).toHaveBeenCalledWith(1);
      expect(Copy.findByPk).toHaveBeenCalledWith(1);
      expect(Checkout.create).toHaveBeenCalledWith({
        copy_id: 1,
        patron_id: 1,
        checkout_date: new Date('2024-01-01'),
        due_date: new Date('2024-01-15'),
      });
    });

    it('should throw 404 error when patron not found', async () => {
      Patron.findByPk.mockResolvedValue(null);
      Copy.findByPk.mockResolvedValue({ id: 1 });

      await expect(
        CheckoutService.createCheckout({
          copyId: 1,
          patronId: 999,
        })
      ).rejects.toThrow('Patron with ID 999 not found');
    });

    it('should throw 404 error when copy not found', async () => {
      Patron.findByPk.mockResolvedValue({ id: 1 });
      Copy.findByPk.mockResolvedValue(null);

      await expect(
        CheckoutService.createCheckout({
          copyId: 999,
          patronId: 1,
        })
      ).rejects.toThrow('Copy with ID 999 not found');
    });

    it('should default checkout_date to current date when not provided', async () => {
      const mockPatron = { id: 1 };
      const mockCopy = { id: 1 };
      const mockCheckout = { id: 1 };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockResolvedValue(mockCheckout);

      const beforeCall = new Date();
      await CheckoutService.createCheckout({
        copyId: 1,
        patronId: 1,
      });
      const afterCall = new Date();

      const createCall = Checkout.create.mock.calls[0][0];
      const checkoutDate = createCall.checkout_date;

      expect(checkoutDate).toBeInstanceOf(Date);
      expect(checkoutDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(checkoutDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should default due_date to checkout_date + 14 days when not provided', async () => {
      const mockPatron = { id: 1 };
      const mockCopy = { id: 1 };
      const mockCheckout = { id: 1 };

      Patron.findByPk.mockResolvedValue(mockPatron);
      Copy.findByPk.mockResolvedValue(mockCopy);
      Checkout.create.mockResolvedValue(mockCheckout);

      await CheckoutService.createCheckout({
        copyId: 1,
        patronId: 1,
      });

      const createCall = Checkout.create.mock.calls[0][0];
      const checkoutDate = createCall.checkout_date;
      const dueDate = createCall.due_date;

      const expectedDueDate = new Date(checkoutDate.getTime() + 14 * 24 * 60 * 60 * 1000);

      expect(dueDate.getTime()).toBe(expectedDueDate.getTime());
    });
  });
});
