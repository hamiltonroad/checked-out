/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('patrons', 'role', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'patron',
      comment: 'Role-based access: patron, librarian, admin',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('patrons', 'role');
  },
};
