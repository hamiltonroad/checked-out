/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('books', 'has_profanity', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if book title contains profane language',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('books', 'has_profanity');
  },
};
