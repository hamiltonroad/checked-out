const { DataTypes } = require('sequelize');

/**
 * Rating model - Book ratings and reviews by patrons
 */
module.exports = (sequelize) => {
  const Rating = sequelize.define(
    'Rating',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      patron_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
          len: [0, 2000], // Maximum 2000 characters for reviews
        },
      },
    },
    {
      tableName: 'ratings',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['book_id', 'patron_id'],
          name: 'unique_patron_book_rating',
        },
        { fields: ['book_id'] },
        { fields: ['patron_id'] },
        { fields: ['rating'] },
      ],
    }
  );

  Rating.associate = (models) => {
    Rating.belongsTo(models.Book, {
      foreignKey: 'book_id',
      as: 'book',
    });

    Rating.belongsTo(models.Patron, {
      foreignKey: 'patron_id',
      as: 'patron',
    });
  };

  return Rating;
};