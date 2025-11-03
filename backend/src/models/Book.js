const { DataTypes } = require('sequelize');

/**
 * Book model - Core book metadata
 */
module.exports = (sequelize) => {
  const Book = sequelize.define(
    'Book',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      isbn: {
        type: DataTypes.STRING(13),
        unique: true,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      publisher: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      publication_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      genre: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'books',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['isbn'] }, { fields: ['title'] }],
    }
  );

  Book.associate = (models) => {
    Book.belongsToMany(models.Author, {
      through: 'book_authors',
      foreignKey: 'book_id',
      otherKey: 'author_id',
      as: 'authors',
    });
  };

  return Book;
};
