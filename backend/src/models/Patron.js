const { DataTypes } = require('sequelize');

/**
 * Patron model - Library cardholders
 */
module.exports = (sequelize) => {
  const Patron = sequelize.define(
    'Patron',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      card_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        allowNull: false,
        validate: {
          isIn: [['active', 'inactive', 'suspended']],
        },
      },
    },
    {
      tableName: 'patrons',
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ['card_number'] }, { fields: ['email'] }, { fields: ['status'] }],
    }
  );

  Patron.associate = (models) => {
    Patron.hasMany(models.Checkout, {
      foreignKey: 'patron_id',
      as: 'checkouts',
    });

    Patron.hasMany(models.Review, {
      foreignKey: 'patron_id',
      as: 'reviews',
    });
  };

  return Patron;
};
