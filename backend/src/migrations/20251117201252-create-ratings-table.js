'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ratings', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // Add unique constraint to ensure one rating per patron per book
    await queryInterface.addIndex('ratings', ['book_id', 'patron_id'], {
      unique: true,
      name: 'unique_patron_book_rating',
    });

    // Add index for faster queries
    await queryInterface.addIndex('ratings', ['book_id'], {
      name: 'idx_rating_book_id',
    });

    await queryInterface.addIndex('ratings', ['patron_id'], {
      name: 'idx_rating_patron_id',
    });

    await queryInterface.addIndex('ratings', ['rating'], {
      name: 'idx_rating_value',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ratings');
  },
};
