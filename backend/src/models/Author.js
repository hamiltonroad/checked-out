const { DataTypes } = require('sequelize');

/**
 * Author model - Book authors
 */
module.exports = (sequelize) => {
  const Author = sequelize.define(
    'Author',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: 'authors',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['last_name'] }],
    }
  );

  Author.associate = (models) => {
    Author.belongsToMany(models.Book, {
      through: 'book_authors',
      foreignKey: 'author_id',
      otherKey: 'book_id',
      as: 'books',
    });
  };

  return Author;
};
