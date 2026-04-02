/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('books', ['genre'], {
      name: 'books_genre_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('books', 'books_genre_idx');
  },
};
