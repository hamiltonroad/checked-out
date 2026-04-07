const { Op } = require('sequelize');
const { Hold, Copy, Patron, Book, WaitlistEntry } = require('../models');
const { HOLD_EXPIRY_DAYS } = require('../config/auth');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

class HoldService {
  /** Create a hold on a specific copy for a patron */
  async createHold(copyId, patronId, waitlistEntryId = null) {
    const copy = await Copy.findByPk(copyId);
    if (!copy) throw ApiError.notFound(`Copy with id ${copyId} not found`);

    const patron = await Patron.findByPk(patronId);
    if (!patron) throw ApiError.notFound(`Patron with id ${patronId} not found`);
    if (patron.status !== 'active') {
      throw ApiError.conflict('Patron account is not active');
    }

    const existingHold = await Hold.findOne({
      where: { copy_id: copyId, status: 'active' },
    });
    if (existingHold) {
      throw ApiError.conflict('An active hold already exists on this copy');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + HOLD_EXPIRY_DAYS);

    return Hold.create({
      copy_id: copyId,
      patron_id: patronId,
      waitlist_entry_id: waitlistEntryId,
      expires_at: expiresAt,
      status: 'active',
    });
  }

  /** Get active holds for a patron with lazy expiration check */
  async getPatronHolds(patronId) {
    await this.expireStaleHolds();

    return Hold.findAll({
      where: { patron_id: patronId, status: 'active' },
      include: [
        {
          model: Copy,
          as: 'copy',
          include: [{ model: Book, as: 'book', attributes: ['id', 'title'] }],
        },
      ],
      order: [['expires_at', 'ASC']],
    });
  }

  /** Find and expire holds past their expiration date */
  async expireStaleHolds(copyIds = null) {
    const where = {
      status: 'active',
      expires_at: { [Op.lt]: new Date() },
    };
    if (copyIds) {
      where.copy_id = { [Op.in]: copyIds };
    }

    const staleHolds = await Hold.findAll({ where });

    await Promise.all(
      staleHolds.map((hold) => {
        logger.info('Hold expired', {
          holdId: hold.id,
          copyId: hold.copy_id,
          patronId: hold.patron_id,
        });
        return hold.update({ status: 'expired' });
      })
    );

    return staleHolds;
  }

  /** Get all active holds for a book+format combination */
  async getActiveHoldsForBookFormat(bookId, format) {
    return Hold.findAll({
      where: { status: 'active' },
      include: [
        {
          model: Copy,
          as: 'copy',
          where: { book_id: bookId, format },
        },
      ],
    });
  }

  /**
   * Create a hold for the front-of-line waitlist patron on a returned copy.
   * Updates the waitlist entry status to 'notified'.
   */
  async createHoldForFrontOfLine(copyId) {
    const copy = await Copy.findByPk(copyId);
    if (!copy) return null;

    const frontEntry = await WaitlistEntry.findOne({
      where: {
        book_id: copy.book_id,
        format: copy.format,
        position: 1,
        status: 'waiting',
      },
    });

    if (!frontEntry) return null;

    // Check if patron already has an active hold for this book+format
    const existingHolds = await this.getActiveHoldsForBookFormat(copy.book_id, copy.format);
    const alreadyHeld = existingHolds.some((h) => h.patron_id === frontEntry.patron_id);
    if (alreadyHeld) return null;

    const hold = await this.createHold(copyId, frontEntry.patron_id, frontEntry.id);

    await frontEntry.update({ status: 'notified' });

    logger.info('Hold created for front-of-line patron', {
      holdId: hold.id,
      patronId: frontEntry.patron_id,
      bookId: copy.book_id,
      format: copy.format,
      copyId,
    });

    return hold;
  }
}

module.exports = new HoldService();
