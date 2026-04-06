const { DataTypes } = require('sequelize');

/**
 * Hold model - Copy-level reservations for waitlist patrons
 */
module.exports = (sequelize) => {
  const Hold = sequelize.define(
    'Hold',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      copy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'copies',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      patron_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'patrons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      waitlist_entry_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'waitlist_entries',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'expired', 'fulfilled'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'holds',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['copy_id'] },
        { fields: ['patron_id'] },
        { fields: ['status'] },
        { fields: ['copy_id', 'status'] },
      ],
    }
  );

  Hold.associate = (models) => {
    Hold.belongsTo(models.Copy, {
      foreignKey: 'copy_id',
      as: 'copy',
    });

    Hold.belongsTo(models.Patron, {
      foreignKey: 'patron_id',
      as: 'patron',
    });

    Hold.belongsTo(models.WaitlistEntry, {
      foreignKey: 'waitlist_entry_id',
      as: 'waitlistEntry',
    });
  };

  return Hold;
};
