const logger = require('../config/logger');

const SHUTDOWN_TIMEOUT_MS = 10000;

/**
 * Closes the HTTP server and waits for in-flight requests to finish.
 *
 * @param {import('http').Server} server
 * @returns {Promise<void>}
 */
function closeHttpServer(server) {
  return new Promise((resolve, reject) => {
    logger.info('Closing HTTP server — waiting for in-flight requests');
    server.close((err) => {
      if (err) {
        logger.error('Error closing HTTP server: %s', err.message);
        return reject(err);
      }
      logger.info('HTTP server closed');
      resolve();
    });
  });
}

/**
 * Closes the Sequelize connection pool.
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {Promise<void>}
 */
async function closeDatabase(sequelize) {
  logger.info('Closing database connection pool');
  await sequelize.close();
  logger.info('Database connection pool closed');
}

/**
 * Registers SIGTERM and SIGINT handlers that perform a comprehensive
 * graceful shutdown sequence: close the HTTP server, close the Sequelize
 * connection pool, and exit with an appropriate code.
 *
 * The handler is idempotent — subsequent signals are ignored once
 * shutdown has started.
 *
 * @param {import('http').Server} server  - The HTTP server instance
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance
 */
function registerGracefulShutdown(server, sequelize) {
  let isShuttingDown = false;

  async function shutdown(signal) {
    if (isShuttingDown) {
      logger.warn('Shutdown already in progress — ignoring duplicate %s', signal);
      return;
    }

    isShuttingDown = true;
    logger.info('%s received — starting graceful shutdown', signal);

    const forceExitTimer = setTimeout(() => {
      logger.error('Shutdown timed out after %dms — forcing exit', SHUTDOWN_TIMEOUT_MS);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    // Ensure the timer does not keep the event loop alive on its own
    forceExitTimer.unref();

    try {
      // 1. Stop accepting new connections
      await closeHttpServer(server);

      // 2. Close the database connection pool
      await closeDatabase(sequelize);

      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown: %s', error.message);
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = { registerGracefulShutdown };
