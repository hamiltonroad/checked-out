const waitlistService = require('../services/WaitlistService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { hasMinimumRole, ROLES } = require('../config/roles');

class WaitlistController {
  /** Join the waitlist for a book+format */
  async joinWaitlist(req, res, next) {
    try {
      const { book_id: bookId, format } = req.body;
      const patronId = req.patron.id;

      const entry = await waitlistService.joinQueue(patronId, bookId, format);

      res.status(201).json(ApiResponse.success(entry, 'Joined waitlist'));
    } catch (error) {
      next(error);
    }
  }

  /** Leave the waitlist for a book+format */
  async leaveWaitlist(req, res, next) {
    try {
      const { book_id: bookId, format } = req.body;
      const patronId = req.patron.id;

      const result = await waitlistService.leaveQueue(patronId, bookId, format);

      res.json(ApiResponse.success(result, 'Left waitlist'));
    } catch (error) {
      next(error);
    }
  }

  /** Get the waitlist for a specific book, optionally filtered by format */
  async getBookWaitlist(req, res, next) {
    try {
      const { id } = req.params;
      const { format } = req.query;

      const entries = await waitlistService.getQueueForBook(parseInt(id, 10), format || null);

      res.json(ApiResponse.success(entries));
    } catch (error) {
      next(error);
    }
  }

  /** Get waitlist entries for a specific patron (patron can only access their own) */
  async getPatronWaitlist(req, res, next) {
    try {
      const { id } = req.params;
      const patronId = req.patron.id;

      if (patronId !== parseInt(id, 10) && !hasMinimumRole(req.patron.role, ROLES.LIBRARIAN)) {
        throw ApiError.forbidden('You can only view your own waitlist');
      }

      const entries = await waitlistService.getPatronWaitlist(parseInt(id, 10));

      res.json(ApiResponse.success(entries));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WaitlistController();
