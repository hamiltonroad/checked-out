const bookController = require('./bookController');
const bookService = require('../services/bookService');
const ApiResponse = require('../utils/ApiResponse');

// Mock the service
jest.mock('../services/bookService');

describe('BookController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('getAllBooks', () => {
    it('should return 200 with books data', async () => {
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

      bookService.getAllBooks.mockResolvedValue(mockBooks);

      await bookController.getAllBooks(mockReq, mockRes, mockNext);

      expect(bookService.getAllBooks).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call bookService.getAllBooks', async () => {
      const mockBooks = [];
      bookService.getAllBooks.mockResolvedValue(mockBooks);

      await bookController.getAllBooks(mockReq, mockRes, mockNext);

      expect(bookService.getAllBooks).toHaveBeenCalledTimes(1);
      expect(bookService.getAllBooks).toHaveBeenCalledWith({
        genre: undefined,
        limit: undefined,
        offset: undefined,
      });
    });

    it('should return ApiResponse.success format', async () => {
      const mockBooks = [{ id: 1, title: 'Book A', authors: [] }];
      bookService.getAllBooks.mockResolvedValue(mockBooks);

      await bookController.getAllBooks(mockReq, mockRes, mockNext);

      const expectedResponse = ApiResponse.success(mockBooks, 'Books retrieved successfully');
      expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockRes.json.mock.calls[0][0]).toHaveProperty('success', true);
      expect(mockRes.json.mock.calls[0][0]).toHaveProperty('data', mockBooks);
    });

    it('should call next(error) on service error', async () => {
      const mockError = new Error('Service error');
      bookService.getAllBooks.mockRejectedValue(mockError);

      await bookController.getAllBooks(mockReq, mockRes, mockNext);

      expect(bookService.getAllBooks).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
