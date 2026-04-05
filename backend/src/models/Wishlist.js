const { DataTypes } = require('sequelize');

/**
 * Wishlist model - Patron book wishlist entries
 */
module.exports = (sequelize) => {
  const Wishlist = sequelize.define(
    'Wishlist',
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
    },
    {
      tableName: 'wishlists',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['patron_id', 'book_id'],
          name: 'unique_patron_book_wishlist',
        },
        { fields: ['patron_id'] },
        { fields: ['book_id'] },
      ],
    }
  );

  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book',
    });

    Wishlist.belongsTo(models.Patron, {
      foreignKey: 'patron_id',
      as: 'patron',
    });
  };

  return Wishlist;
};
