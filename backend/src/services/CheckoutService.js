const { Op } = require('sequelize');
const { Checkout, Patron, Copy, Book, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');

const MS_PER_DAY = 86400000;

/** Shared Sequelize include config for checkout queries with patron and book details */
const CHECKOUT_INCLUDES = [
  {
    model: Patron,
    as: 'patron',
    attributes: ['id', 'first_name', 'last_name'],
  },
  {
    model: Copy,
    as: 'copy',
    attributes: ['id'],
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['title'],
      },
    ],
  },
];

/** Sequelize include config for overdue queries — adds patron contact fields */
const OVERDUE_INCLUDES = [
  {
    model: Patron,
    as: 'patron',
    attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
  },
  {
    model: Copy,
    as: 'copy',
    attributes: ['id'],
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['id', 'title'],
      },
    ],
  },
];

/** Format an overdue checkout record for API response */
function formatOverdueCheckoutResponse(checkout) {
  return {
    id: checkout.id,
    dueDate: checkout.due_date,
    returnDate: checkout.return_date,
    daysOverdue: checkout.getDataValue('daysOverdue'),
    book: {
      id: checkout.copy.book.id,
      title: checkout.copy.book.title,
    },
    patron: {
      id: checkout.patron.id,
      name: `${checkout.patron.first_name} ${checkout.patron.last_name}`,
      email: checkout.patron.email || null,
      phone: checkout.patron.phone || null,
    },
  };
}

/** Format a checkout record for API response */
function formatCheckoutResponse(checkout) {
  return {
    id: checkout.id,
    patronId: checkout.patron.id,
    patronName: `${checkout.patron.first_name} ${checkout.patron.last_name}`,
    bookTitle: checkout.copy.book.title,
    checkoutDate: checkout.checkout_date,
    returnDate: checkout.return_date,
  };
}

/** Compute days until due from a due date (negative = overdue) */
function computeDaysUntilDue(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  due.setUTCHours(0, 0, 0, 0);
  return Math.ceil((due - today) / MS_PER_DAY);
}

/** Format a current checkout record for API response with daysUntilDue */
function formatCurrentCheckoutResponse(checkout) {
  return {
    id: checkout.id,
    patronId: checkout.patron.id,
    patronName: `${checkout.patron.first_name} ${checkout.patron.last_name}`,
    bookTitle: checkout.copy.book.title,
    checkoutDate: checkout.checkout_date,
    dueDate: checkout.due_date,
    daysUntilDue: computeDaysUntilDue(checkout.due_date),
    returnDate: checkout.return_date,
  };
}

class CheckoutService {
  /** Create a new checkout record */
  // eslint-disable-next-line class-methods-use-this
  async createCheckout({ patronId, copyId }) {
    const patron = await Patron.findByPk(patronId);
    if (!patron) throw new ApiError(404, 'Patron not found');

    const copy = await Copy.findByPk(copyId);
    if (!copy) throw new ApiError(404, 'Copy not found');

    const activeCheckout = await Checkout.findOne({
      where: { copy_id: copyId, return_date: null },
    });
    if (activeCheckout) throw ApiError.conflict('This copy is already checked out');

    const checkoutDate = new Date();
    const dueDate = new Date(checkoutDate);
    dueDate.setDate(dueDate.getDate() + 14);

    return Checkout.create({
      copy_id: copyId,
      patron_id: patronId,
      checkout_date: checkoutDate,
      due_date: dueDate,
      return_date: null,
    });
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
  async returnCheckout(id) {
    const checkout = await Checkout.findByPk(id, {
      include: CHECKOUT_INCLUDES,
    });

    if (!checkout) throw ApiError.notFound('Checkout not found');
    if (checkout.return_date) throw ApiError.conflict('Checkout has already been returned');

    // Conditional update for concurrency safety
    const [updatedCount] = await Checkout.update(
      { return_date: new Date() },
      { where: { id, return_date: null } }
    );

    if (updatedCount === 0) throw ApiError.conflict('Checkout has already been returned');
    await checkout.reload();
    return formatCheckoutResponse(checkout);
  }
}

module.exports = new CheckoutService();
