/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('patrons', 'password_hash', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Bcrypt-hashed password for JWT authentication',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('patrons', 'password_hash');
  },
};
