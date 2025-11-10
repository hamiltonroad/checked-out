const { DataTypes } = require('sequelize');

/**
 * Review model - Book ratings and reviews by patrons
 */
module.exports = (sequelize) => {
  const Review = sequelize.define(
    'Review',
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
      patron_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'patrons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
          isInt: true,
        },
      },
      review_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000],
        },
      },
    },
    {
      tableName: 'reviews',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['book_id'] },
        { fields: ['patron_id'] },
        { fields: ['book_id', 'patron_id'], unique: true },
      ],
    }
  );

  Review.associate = (models) => {
    Review.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book',
    });
    Review.belongsTo(models.Patron, {
      foreignKey: 'patron_id',
      as: 'patron',
    });
  };

  return Review;
};
