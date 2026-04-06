const { Patron, Copy, Book } = require('../models');

const MS_PER_DAY = 86400000;

/** Shared Sequelize include config for checkout queries with patron and book details */
const CHECKOUT_INCLUDES = [
  { model: Patron, as: 'patron', attributes: ['id', 'first_name', 'last_name'] },
  {
    model: Copy,
    as: 'copy',
    attributes: ['id'],
    include: [{ model: Book, as: 'book', attributes: ['title'] }],
  },
];

/** Sequelize include config for overdue queries — adds patron contact fields */
const OVERDUE_INCLUDES = [
  { model: Patron, as: 'patron', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
  {
    model: Copy,
    as: 'copy',
    attributes: ['id'],
    include: [{ model: Book, as: 'book', attributes: ['id', 'title'] }],
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
    copyId: checkout.copy_id,
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

module.exports = {
  CHECKOUT_INCLUDES,
  OVERDUE_INCLUDES,
  formatOverdueCheckoutResponse,
  formatCheckoutResponse,
  formatCurrentCheckoutResponse,
};
