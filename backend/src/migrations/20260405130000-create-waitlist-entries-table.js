/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('waitlist_entries', {
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
      format: {
        type: Sequelize.ENUM('physical', 'kindle'),
        allowNull: false,
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('waiting', 'notified', 'fulfilled', 'cancelled'),
        allowNull: false,
        defaultValue: 'waiting',
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

    // Composite unique constraint: one entry per patron per book per format
    await queryInterface.addIndex('waitlist_entries', ['patron_id', 'book_id', 'format'], {
      unique: true,
      name: 'unique_patron_book_format_waitlist',
    });

    await queryInterface.addIndex('waitlist_entries', ['patron_id'], {
      name: 'idx_waitlist_patron_id',
    });

    await queryInterface.addIndex('waitlist_entries', ['book_id'], {
      name: 'idx_waitlist_book_id',
    });

    await queryInterface.addIndex('waitlist_entries', ['book_id', 'format', 'position'], {
      name: 'idx_waitlist_book_format_position',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('waitlist_entries');
  },
};
