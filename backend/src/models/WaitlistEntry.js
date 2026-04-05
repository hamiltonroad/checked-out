const { DataTypes } = require('sequelize');

/**
 * WaitlistEntry model - Format-specific waitlist queue entries
 */
module.exports = (sequelize) => {
  const WaitlistEntry = sequelize.define(
    'WaitlistEntry',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patron_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      format: {
        type: DataTypes.ENUM('physical', 'kindle'),
        allowNull: false,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('waiting', 'notified', 'fulfilled', 'cancelled'),
        allowNull: false,
        defaultValue: 'waiting',
      },
    },
    {
      tableName: 'waitlist_entries',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['patron_id', 'book_id', 'format'],
          name: 'unique_patron_book_format_waitlist',
        },
        { fields: ['patron_id'] },
        { fields: ['book_id'] },
        { fields: ['book_id', 'format', 'position'] },
      ],
    }
  );

  WaitlistEntry.associate = (models) => {
    WaitlistEntry.belongsTo(models.Patron, {
      foreignKey: 'patron_id',
      as: 'patron',
    });

    WaitlistEntry.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book',
    });
  };

  return WaitlistEntry;
};
