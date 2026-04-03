const { Copy, Checkout, Book } = require('../models');
const ApiError = require('../utils/ApiError');

class CopyService {
  /**
   * Get available copies for a specific book (no active checkout)
   * @param {number} bookId - ID of the book
   * @returns {Promise<Array>} Array of available copy objects
   */
  // eslint-disable-next-line class-methods-use-this
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
}

module.exports = new CopyService();
