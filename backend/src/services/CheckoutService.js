const { Op } = require('sequelize');
const { Checkout, Patron, Copy, WaitlistEntry, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const {
  CHECKOUT_INCLUDES,
  OVERDUE_INCLUDES,
  formatOverdueCheckoutResponse,
  formatCheckoutResponse,
  formatCurrentCheckoutResponse,
} = require('./checkoutFormatters');

class CheckoutService {
  /** Create a new checkout record */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout({ patronId, copyId }) {
    const patron = await Patron.findByPk(patronId);
    if (!patron) throw ApiError.notFound(`Patron with id ${patronId} not found`);

    if (patron.status !== 'active') {
      throw ApiError.conflict(
        `Patron ${patron.first_name} ${patron.last_name} cannot check out books (status: ${patron.status})`
      );
    }

    const copy = await Copy.findByPk(copyId);
    if (!copy) throw ApiError.notFound(`Copy with id ${copyId} not found`);

    const activeCheckout = await Checkout.findOne({
      where: { copy_id: copyId, return_date: null },
    });
    if (activeCheckout) throw ApiError.conflict(`Copy ${copyId} is already checked out`);

    // Waitlist gating: if a queue exists for this book+format, only front-of-line can checkout
    const frontOfLine = await WaitlistEntry.findOne({
      where: { book_id: copy.book_id, format: copy.format, position: 1, status: 'waiting' },
    });
    if (frontOfLine && frontOfLine.patron_id !== patronId) {
      throw ApiError.conflict(
        'This format has a waitlist. Only the next patron in line can check out.'
      );
    }

    const checkoutDate = new Date();
    const dueDate = new Date(checkoutDate);
    dueDate.setDate(dueDate.getDate() + 14);

    const checkout = await Checkout.create({
      copy_id: copyId,
      patron_id: patronId,
      checkout_date: checkoutDate,
      due_date: dueDate,
      return_date: null,
    });

    // If the patron was front-of-line, fulfill their waitlist entry and reorder queue
    if (frontOfLine && frontOfLine.patron_id === patronId) {
      await frontOfLine.update({ status: 'fulfilled' });
      await WaitlistEntry.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            book_id: copy.book_id,
            format: copy.format,
            position: { [Op.gt]: 1 },
            status: 'waiting',
          },
        }
      );
    }

    return checkout;
  }

  /** Get only currently active checkouts (not yet returned) with due-date info */
  // eslint-disable-next-line class-methods-use-this
  async getCurrentCheckouts() {
    const checkouts = await Checkout.findAll({
      where: { return_date: null },
      include: CHECKOUT_INCLUDES,
      order: [['due_date', 'ASC']],
    });

    return checkouts.map(formatCurrentCheckoutResponse);
  }

  /**
   * Get overdue checkouts (due_date < today, not yet returned).
   * days_overdue computed via DATEDIFF at query time — never stored.
   * NOTE: DATEDIFF uses MySQL server timezone; assumes UTC.
   */
  // eslint-disable-next-line class-methods-use-this
  async getOverdueCheckouts() {
    const daysOverdueAttr = [sequelize.literal('DATEDIFF(CURDATE(), due_date)'), 'daysOverdue'];
    const checkouts = await Checkout.findAll({
      attributes: { include: [daysOverdueAttr] },
      where: {
        return_date: null,
        due_date: { [Op.lt]: sequelize.fn('CURDATE') },
      },
      include: OVERDUE_INCLUDES,
      order: [[sequelize.literal('daysOverdue'), 'DESC']],
    });

    return checkouts.map(formatOverdueCheckoutResponse);
  }

  /** Get all checkout records with patron and book details */
  // eslint-disable-next-line class-methods-use-this
  async getAllCheckouts() {
    const checkouts = await Checkout.findAll({
      include: CHECKOUT_INCLUDES,
      order: [['created_at', 'DESC']],
    });

    return checkouts.map(formatCheckoutResponse);
  }

  /** Mark a checkout as returned */
  // eslint-disable-next-line class-methods-use-this
  async returnCheckout(id, returnDate = null) {
    const checkout = await Checkout.findByPk(id, { include: CHECKOUT_INCLUDES });

    if (!checkout) throw ApiError.notFound('Checkout not found');
    if (checkout.return_date) throw ApiError.conflict('Checkout has already been returned');

    const effectiveReturnDate = returnDate ? new Date(returnDate) : new Date();
    if (returnDate && Number.isNaN(effectiveReturnDate.getTime())) {
      throw ApiError.badRequest('returnDate is not a valid date');
    }
    if (effectiveReturnDate < new Date(checkout.checkout_date)) {
      throw ApiError.badRequest('returnDate cannot be before the checkout date', [
        { field: 'returnDate', message: 'returnDate cannot be before the checkout date' },
      ]);
    }

    // Conditional update for concurrency safety
    const [updatedCount] = await Checkout.update(
      { return_date: effectiveReturnDate },
      { where: { id, return_date: null } }
    );

    if (updatedCount === 0) throw ApiError.conflict('Checkout has already been returned');
    await checkout.reload();

    // Notification seam: notify front-of-line patron for the returned copy's format
    const returnedCopy = await Copy.findByPk(checkout.copy_id);
    if (returnedCopy) {
      const frontEntry = await WaitlistEntry.findOne({
        where: {
          book_id: returnedCopy.book_id,
          format: returnedCopy.format,
          position: 1,
          status: 'waiting',
        },
      });
      if (frontEntry) {
        // NOTIFICATION SEAM: Plug in email/in-app notification delivery here.
        logger.info('Waitlist notification: patron reached front of line', {
          patronId: frontEntry.patron_id,
          bookId: returnedCopy.book_id,
          format: returnedCopy.format,
        });
      }
    }

    return formatCheckoutResponse(checkout);
  }
}

module.exports = new CheckoutService();
