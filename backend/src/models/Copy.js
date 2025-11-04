const { DataTypes } = require('sequelize');

/**
 * Copy model - Physical and Kindle instances of books
 */
module.exports = (sequelize) => {
  const Copy = sequelize.define(
    'Copy',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      format: {
        type: DataTypes.ENUM('physical', 'kindle'),
        allowNull: false,
      },
      copy_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      barcode: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: true,
      },
      kindle_asin: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: 'copies',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['book_id'] },
        { fields: ['barcode'] },
        { fields: ['format'] },
      ],
    }
  );

  Copy.associate = (models) => {
    Copy.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book',
    });

    Copy.hasMany(models.Checkout, {
      foreignKey: 'copy_id',
      as: 'checkouts',
    });
  };

  return Copy;
};
