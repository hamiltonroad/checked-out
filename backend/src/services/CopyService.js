const { Copy, Checkout, Book, WaitlistEntry } = require('../models');
const ApiError = require('../utils/ApiError');

const DEFAULT_CHECKOUTABLE_LIMIT = 10;

class CopyService {
  /**
   * Get available copies for a specific book (no active checkout)
   * @param {number} bookId - ID of the book
   * @returns {Promise<Array>} Array of available copy objects
   */
  async getAvailableCopiesByBook(bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw ApiError.notFound(`Book with id ${bookId} not found`);
    }

    const copies = await Copy.findAll({
      where: { book_id: bookId },
      include: [
        {
          model: Checkout,
          as: 'checkouts',
          where: { return_date: null },
          required: false,
        },
      ],
    });

    const allCount = copies.length;

    const available = copies
      .filter((copy) => copy.checkouts.length === 0)
      .map((copy) => ({
        id: copy.id,
        copy_number: copy.copy_number,
        format: copy.format,
        barcode: copy.barcode,
        asin: copy.kindle_asin,
      }));

    return { available, totalCopies: allCount };
  }

  /**
   * Find copies that are currently checkoutable: not actively checked out
   * AND not waitlist-gated by a front-of-line waiter for the same
   * (book, format).
   *
   * READ-ONLY HINT: this is a discovery query, not a reservation. Results
   * may race with concurrent checkouts/holds and are NOT guaranteed to
   * still be free at the moment a downstream checkout is attempted. Do
   * not rely on this endpoint for atomic availability — use the standard
   * checkout flow which performs its own gating inside a transaction.
   *
   * Waitlist semantics: any front-of-line ('waiting', position 1) entry
   * for the same (book_id, format) excludes that copy. The endpoint is
   * unauthenticated for librarian-style probing; per-patron exclusion
   * (e.g. excludingPatronId) is reserved for a future authenticated
   * caller — see issue #240.
   *
   * @param {object} opts
   * @param {number} [opts.bookId] - optional Book filter
   * @param {string} [opts.format] - optional 'physical' or 'kindle'
   * @param {number} [opts.limit=10] - max rows returned (Joi caps at 100)
   * @returns {Promise<{copies: Array, count: number}>}
   */
  async findCheckoutable({ bookId, format, limit = DEFAULT_CHECKOUTABLE_LIMIT } = {}) {
    const where = {};
    if (bookId !== undefined) where.book_id = bookId;
    if (format !== undefined) where.format = format;

    const copies = await Copy.findAll({
      where,
      include: [
        {
          model: Checkout,
          as: 'checkouts',
          where: { return_date: null },
          required: false,
        },
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title'],
        },
      ],
    });

    const freeCopies = copies.filter((copy) => (copy.checkouts || []).length === 0);

    const waitlistWhere = { status: 'waiting', position: 1 };
    if (bookId !== undefined) waitlistWhere.book_id = bookId;
    if (format !== undefined) waitlistWhere.format = format;

    const gatingEntries = await WaitlistEntry.findAll({
      where: waitlistWhere,
      attributes: ['book_id', 'format'],
    });

    const gatedKeys = new Set(gatingEntries.map((e) => `${e.book_id}:${e.format}`));

    const ungated = freeCopies.filter((copy) => !gatedKeys.has(`${copy.book_id}:${copy.format}`));

    const sliced = ungated.slice(0, limit);

    const mapped = sliced.map((copy) => ({
      id: copy.id,
      copy_number: copy.copy_number,
      format: copy.format,
      barcode: copy.barcode,
      asin: copy.kindle_asin,
      book: copy.book ? { id: copy.book.id, title: copy.book.title } : null,
    }));

    return { copies: mapped, count: mapped.length };
  }
}

module.exports = new CopyService();
