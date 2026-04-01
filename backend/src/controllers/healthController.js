const healthService = require('../services/HealthService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Health Controller - HTTP handlers for health check endpoints
 */
class HealthController {
  /**
   * Liveness check - confirms the application process is running
   * GET /health/live
   * @param {Object} _req - Express request (unused)
   * @param {Object} res - Express response
   */
  // eslint-disable-next-line class-methods-use-this
  liveness(_req, res) {
    res.json(
      ApiResponse.success(
        {
          status: 'ok',
          timestamp: new Date().toISOString(),
        },
        'Application is alive'
      )
    );
  }

  /**
   * Readiness check - confirms the application can serve traffic
   * Includes database connectivity verification
   * GET /health/ready
   * @param {Object} _req - Express request (unused)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  // eslint-disable-next-line class-methods-use-this
  async readiness(_req, res, next) {
    try {
      const dbStatus = await healthService.checkDatabase();

      const status = dbStatus.connected ? 'ok' : 'degraded';
      const database = dbStatus.connected ? 'connected' : 'disconnected';
      const httpStatus = dbStatus.connected ? 200 : 503;

      const data = {
        status,
        database,
        timestamp: new Date().toISOString(),
        responseTimeMs: dbStatus.responseTimeMs,
      };

      const message = dbStatus.connected
        ? 'Application is ready'
        : 'Application is degraded — database unavailable';

      res.status(httpStatus).json(ApiResponse.success(data, message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
