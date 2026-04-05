const { Op } = require('sequelize');
const { WaitlistEntry, Patron, Book, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

class WaitlistService {
  /** Add a patron to the waitlist for a specific book+format */
  // eslint-disable-next-line class-methods-use-this
  async joinQueue(patronId, bookId, format) {
    const book = await Book.findByPk(bookId);
    if (!book) throw ApiError.notFound('Book not found');

    const patron = await Patron.findByPk(patronId);
    if (!patron) throw ApiError.notFound('Patron not found');
    if (patron.status !== 'active') {
      throw ApiError.conflict('Patron account is not active');
    }

    const existing = await WaitlistEntry.findOne({
      where: { patron_id: patronId, book_id: bookId, format },
    });
    if (existing) {
      throw ApiError.conflict('Already on the waitlist for this book and format');
    }

    const maxPosition = await WaitlistEntry.max('position', {
      where: { book_id: bookId, format, status: 'waiting' },
    });

    const entry = await WaitlistEntry.create({
      patron_id: patronId,
      book_id: bookId,
      format,
      position: (maxPosition || 0) + 1,
      status: 'waiting',
    });

    return entry;
  }

  /** Remove a patron from the waitlist and reorder remaining positions */
  // eslint-disable-next-line class-methods-use-this
  async leaveQueue(patronId, bookId, format) {
    const entry = await WaitlistEntry.findOne({
      where: { patron_id: patronId, book_id: bookId, format, status: 'waiting' },
    });
    if (!entry) throw ApiError.notFound('Waitlist entry not found');

    const removedPosition = entry.position;

    await sequelize.transaction(async (transaction) => {
      await entry.destroy({ transaction });

      await WaitlistEntry.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            book_id: bookId,
            format,
            position: { [Op.gt]: removedPosition },
            status: 'waiting',
          },
          transaction,
        }
      );
    });

    return { message: 'Removed from waitlist' };
  }

  /** Get the position of a patron in the waitlist for a book+format */
  // eslint-disable-next-line class-methods-use-this
  async getPosition(patronId, bookId, format) {
    const entry = await WaitlistEntry.findOne({
      where: { patron_id: patronId, book_id: bookId, format, status: 'waiting' },
      attributes: ['position'],
    });
    return entry ? entry.position : null;
  }

  /** Get all waiting entries for a book, optionally filtered by format */
  // eslint-disable-next-line class-methods-use-this
  async getQueueForBook(bookId, format = null) {
    const where = { book_id: bookId, status: 'waiting' };
    if (format) where.format = format;

    return WaitlistEntry.findAll({
      where,
      include: [{ model: Patron, as: 'patron', attributes: ['id', 'first_name', 'last_name'] }],
      order: [
        ['format', 'ASC'],
        ['position', 'ASC'],
      ],
    });
  }

  /** Get all waitlist entries for a patron */
  // eslint-disable-next-line class-methods-use-this
  async getPatronWaitlist(patronId) {
    return WaitlistEntry.findAll({
      where: { patron_id: patronId, status: 'waiting' },
      include: [{ model: Book, as: 'book', attributes: ['id', 'title'] }],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Notify the front-of-line patron that a copy is available.
   * NOTIFICATION SEAM: Plug in email/in-app notification delivery here.
   */
  // eslint-disable-next-line class-methods-use-this
  async notifyFrontOfLine(patronId, bookId, format) {
    logger.info('Waitlist notification: patron reached front of line', {
      patronId,
      bookId,
      format,
    });
    // NOTIFICATION SEAM: Plug in email/in-app notification delivery here.
    // Future implementation would send an email or in-app notification
    // to the patron informing them a copy is now available.
  }

  /** After a return, check if someone is next in line and notify them */
  // eslint-disable-next-line class-methods-use-this
  async advanceQueue(bookId, format) {
    const frontEntry = await WaitlistEntry.findOne({
      where: { book_id: bookId, format, position: 1, status: 'waiting' },
    });

    if (frontEntry) {
      await this.notifyFrontOfLine(frontEntry.patron_id, bookId, format);
    }
  }
}

module.exports = new WaitlistService();
