/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('holds', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      copy_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'copies',
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
      waitlist_entry_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'waitlist_entries',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'expired', 'fulfilled'),
        allowNull: false,
        defaultValue: 'active',
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

    await queryInterface.addIndex('holds', ['copy_id'], {
      name: 'idx_holds_copy_id',
    });

    await queryInterface.addIndex('holds', ['patron_id'], {
      name: 'idx_holds_patron_id',
    });

    await queryInterface.addIndex('holds', ['status'], {
      name: 'idx_holds_status',
    });

    await queryInterface.addIndex('holds', ['copy_id', 'status'], {
      name: 'idx_holds_copy_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('holds');
  },
};
