const { Op } = require('sequelize');
const { Copy, Checkout, Book, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { DEFAULT_CHECKOUTABLE_LIMIT } = require('../constants/copyConstants');

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
   * Find copies that are currently checkoutable: not actively checked out,
   * not held for another patron, AND not waitlist-gated by a front-of-line
   * waiter for the same (book, format).
   *
   * READ-ONLY HINT: this is a discovery query, not a reservation. Results
   * may race with concurrent checkouts/holds and are NOT guaranteed to
   * still be free at the moment a downstream checkout is attempted. Do
   * not rely on this endpoint for atomic availability — use the standard
   * checkout flow which performs its own gating inside a transaction.
   *
   * Waitlist semantics: any front-of-line ('waiting', position 1) entry
   * for the same (book_id, format) excludes that copy. The endpoint is
   * authenticated; only librarians/admins/patrons may probe it.
   *
   * @param {object} opts
   * @param {number} [opts.bookId] - optional Book filter
   * @param {string} [opts.format] - optional 'physical' or 'kindle'
   * @param {number} [opts.limit=10] - max rows returned (Joi caps at 100)
   * @returns {Promise<{copies: Array, count: number}>}
   */
  async findCheckoutable({ bookId, format, limit = DEFAULT_CHECKOUTABLE_LIMIT } = {}) {
    // Gating is pushed into the SQL layer via three correlated subqueries:
    //   1. NOT EXISTS active checkout for this copy
    //   2. NOT EXISTS active hold on this copy (any patron) — mirrors the
    //      hold-gating in CheckoutService.checkOutCopy. The discovery
    //      query is patron-agnostic, so we exclude any held copy rather
    //      than try to predict which patron will use the result.
    //   3. NOT EXISTS front-of-line ('waiting', position=1) waitlist entry
    //      for the same (book_id, format)
    // All literals reference only column names — NO user-supplied values
    // are interpolated, satisfying the no-raw-SQL-with-user-input rule.
    // `limit` is applied at the DB layer so we never scan the full catalog.
    const where = {
      [Op.and]: [
        sequelize.literal(
          'NOT EXISTS (SELECT 1 FROM checkouts AS c WHERE c.copy_id = `Copy`.`id` AND c.return_date IS NULL)'
        ),
        sequelize.literal(
          "NOT EXISTS (SELECT 1 FROM holds AS h WHERE h.copy_id = `Copy`.`id` AND h.status = 'active')"
        ),
        sequelize.literal(
          "NOT EXISTS (SELECT 1 FROM waitlist_entries AS w WHERE w.book_id = `Copy`.`book_id` AND w.format = `Copy`.`format` AND w.status = 'waiting' AND w.position = 1)"
        ),
      ],
    };
    if (bookId !== undefined) where.book_id = bookId;
    if (format !== undefined) where.format = format;

    const copies = await Copy.findAll({
      where,
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title'],
        },
      ],
      limit,
    });

    const mapped = copies.map((copy) => ({
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
