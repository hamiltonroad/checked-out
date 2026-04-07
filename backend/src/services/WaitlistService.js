const { Op } = require('sequelize');
const { WaitlistEntry, Patron, Book, Copy, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

class WaitlistService {
  /** Add a patron to the waitlist for a specific book+format */
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
  async getPosition(patronId, bookId, format) {
    const entry = await WaitlistEntry.findOne({
      where: { patron_id: patronId, book_id: bookId, format, status: 'waiting' },
      attributes: ['position'],
    });
    return entry ? entry.position : null;
  }

  /** Get all waiting entries for a book, optionally filtered by format */
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

  /** Get all waitlist entries for a patron, enriched with queue size and total copies */
  async getPatronWaitlist(patronId) {
    const entries = await WaitlistEntry.findAll({
      where: { patron_id: patronId, status: 'waiting' },
      include: [{ model: Book, as: 'book', attributes: ['id', 'title'] }],
      order: [['created_at', 'DESC']],
    });

    const pairs = [...new Set(entries.map((e) => `${e.book_id}:${e.format}`))];

    const [queueCounts, copyCounts] = await Promise.all([
      Promise.all(
        pairs.map(async (pair) => {
          const [bookId, format] = pair.split(':');
          const count = await WaitlistEntry.count({
            where: { book_id: bookId, format, status: 'waiting' },
          });
          return { key: pair, count };
        })
      ),
      Promise.all(
        pairs.map(async (pair) => {
          const [bookId, format] = pair.split(':');
          const count = await Copy.count({
            where: { book_id: bookId, format },
          });
          return { key: pair, count };
        })
      ),
    ]);

    const queueMap = Object.fromEntries(queueCounts.map((q) => [q.key, q.count]));
    const copyMap = Object.fromEntries(copyCounts.map((c) => [c.key, c.count]));

    return entries.map((entry) => {
      const plain = entry.toJSON();
      const key = `${plain.book_id}:${plain.format}`;
      plain.queue_size = queueMap[key] || 0;
      plain.total_copies = copyMap[key] || 0;
      return plain;
    });
  }

  /**
   * Notify the front-of-line patron that a copy is available.
   * NOTIFICATION SEAM: Plug in email/in-app notification delivery here.
   */
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
