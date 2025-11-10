/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      patron_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patrons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000],
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('reviews', ['book_id']);
    await queryInterface.addIndex('reviews', ['patron_id']);

    // Add unique constraint to prevent duplicate reviews
    await queryInterface.addIndex('reviews', ['book_id', 'patron_id'], {
      unique: true,
      name: 'unique_book_patron_review',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reviews');
  },
};
