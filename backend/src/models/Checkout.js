const { DataTypes } = require('sequelize');

/**
 * Checkout model - Transaction records for borrowed items
 */
module.exports = (sequelize) => {
  const Checkout = sequelize.define(
    'Checkout',
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
        onDelete: 'RESTRICT',
      },
      patron_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'patrons',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      checkout_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      return_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'checkouts',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['copy_id'] },
        { fields: ['patron_id'] },
        { fields: ['checkout_date'] },
        { fields: ['due_date'] },
        { fields: ['return_date'] },
      ],
    }
  );

  Checkout.associate = (models) => {
    Checkout.belongsTo(models.Copy, {
      foreignKey: 'copy_id',
      as: 'copy',
    });
  };

  return Checkout;
};
