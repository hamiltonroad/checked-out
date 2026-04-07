const { Author } = require('../models');

/**
 * Author Service - Business logic for author operations
 */
class AuthorService {
  /**
   * Get all authors sorted by last name, then first name
   * @returns {Promise<Array<Object>>} List of authors with id, first_name, last_name
   */
  async getAllAuthors() {
    const authors = await Author.findAll({
      attributes: ['id', 'first_name', 'last_name'],
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
      ],
    });

    return authors;
  }
}

module.exports = new AuthorService();
