const { sequelize } = require('../models');
const logger = require('../config/logger');

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Health Service - Database connectivity and system health checks
 */
class HealthService {
  /**
   * Check database connectivity with timeout
   * @param {number} timeoutMs - Maximum time to wait for DB response
   * @returns {Promise<Object>} Database health status
   */
  async checkDatabase(timeoutMs = DEFAULT_TIMEOUT_MS) {
    const start = Date.now();

    let timeoutHandle;

    try {
      await Promise.race([
        sequelize.authenticate(),
        new Promise((_, reject) => {
          timeoutHandle = setTimeout(
            () => reject(new Error('Database health check timed out')),
            timeoutMs
          );
        }),
      ]);

      const responseTimeMs = Date.now() - start;

      return {
        connected: true,
        responseTimeMs,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - start;

      logger.warn('Database health check failed: %s', error.message);

      return {
        connected: false,
        responseTimeMs,
      };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}

module.exports = new HealthService();
