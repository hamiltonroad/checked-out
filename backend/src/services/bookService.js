const { Book, Author } = require('../models');

/**
 * Book Service - Business logic for book operations
 */
class BookService {
  /**
   * Get all books with their authors
   * @returns {Promise<Array>} List of books with authors
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllBooks() {
    return Book.findAll({
      include: [
        {
          model: Author,
          as: 'authors',
          through: { attributes: [] },
        },
      ],
      order: [['title', 'ASC']],
    });
  }
}

module.exports = new BookService();
