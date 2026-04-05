import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupMockRequire } from '../test-utils/mockRequire.js';

const { require, injectMock } = setupMockRequire(import.meta.url);

const mockCheckoutService = {
  createCheckout: vi.fn(),
  getCurrentCheckouts: vi.fn(),
  getOverdueCheckouts: vi.fn(),
  getAllCheckouts: vi.fn(),
  returnCheckout: vi.fn(),
};

const mockPatronCheckoutService = {
  getByPatronId: vi.fn(),
};

injectMock('../services/CheckoutService', mockCheckoutService);
injectMock('../services/PatronCheckoutService', mockPatronCheckoutService);

const checkoutController = require('./CheckoutController');
const ApiResponse = require('../utils/ApiResponse');

describe('CheckoutController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      query: {},
      method: 'POST',
      originalUrl: '/api/v1/checkouts',
      patron: { id: 42, first_name: 'Jane', last_name: 'Doe' },
    };

    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('createCheckout', () => {
    it('should use patron ID from req.patron, not req.body', async () => {
      mockReq.body = { patron_id: 99, copy_id: 5 };
      const mockCheckout = { id: 1, patron_id: 42, copy_id: 5 };
      mockCheckoutService.createCheckout.mockResolvedValue(mockCheckout);

      await checkoutController.createCheckout(mockReq, mockRes, mockNext);

      expect(mockCheckoutService.createCheckout).toHaveBeenCalledWith({
        patronId: 42,
        copyId: 5,
      });
    });

    it('should ignore patron_id from request body', async () => {
      mockReq.body = { patron_id: 999, copy_id: 3 };
      const mockCheckout = { id: 2, patron_id: 42, copy_id: 3 };
      mockCheckoutService.createCheckout.mockResolvedValue(mockCheckout);

      await checkoutController.createCheckout(mockReq, mockRes, mockNext);

      expect(mockCheckoutService.createCheckout).toHaveBeenCalledWith({
        patronId: 42,
        copyId: 3,
      });
      expect(mockCheckoutService.createCheckout).not.toHaveBeenCalledWith(
        expect.objectContaining({ patronId: 999 })
      );
    });

    it('should return 201 with checkout data on success', async () => {
      mockReq.body = { copy_id: 5 };
      const mockCheckout = { id: 1, patron_id: 42, copy_id: 5 };
      mockCheckoutService.createCheckout.mockResolvedValue(mockCheckout);

      await checkoutController.createCheckout(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      const expectedResponse = ApiResponse.success(
        mockCheckout,
        'Checkout created successfully'
      );
      expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should call next(error) on service error', async () => {
      mockReq.body = { copy_id: 5 };
      const mockError = new Error('Service error');
      mockCheckoutService.createCheckout.mockRejectedValue(mockError);

      await checkoutController.createCheckout(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
