const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
});

const db = {
  sequelize,
  Sequelize,
};

// Models will be imported and added here
// Example:
// db.User = require('./User')(sequelize);
// db.Book = require('./Book')(sequelize);

// Associations will be defined here
// Example:
// db.User.hasMany(db.Book);
// db.Book.belongsTo(db.User);

module.exports = db;
