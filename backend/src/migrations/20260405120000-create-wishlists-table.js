/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wishlists', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      patron_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patrons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Composite unique constraint: one wishlist entry per patron per book
    await queryInterface.addIndex('wishlists', ['patron_id', 'book_id'], {
      unique: true,
      name: 'unique_patron_book_wishlist',
    });

    await queryInterface.addIndex('wishlists', ['patron_id'], {
      name: 'idx_wishlist_patron_id',
    });

    await queryInterface.addIndex('wishlists', ['book_id'], {
      name: 'idx_wishlist_book_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wishlists');
  },
};
