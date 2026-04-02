require('dotenv').config();
const { validateEnv } = require('./config/envValidator');

validateEnv();

const app = require('./app');
const logger = require('./config/logger');
const { sequelize } = require('./models');
const { registerGracefulShutdown } = require('./utils/gracefulShutdown');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

registerGracefulShutdown(server, sequelize);

module.exports = server;
