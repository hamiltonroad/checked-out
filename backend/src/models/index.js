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

// Import models
db.Book = require('./Book')(sequelize);
db.Author = require('./Author')(sequelize);
db.Copy = require('./Copy')(sequelize);
db.Checkout = require('./Checkout')(sequelize);
db.Patron = require('./Patron')(sequelize);
db.Rating = require('./Rating')(sequelize);

// Define associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
