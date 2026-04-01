const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

/**
 * Health Check Routes
 * Base path: /health
 *
 * GET /health       — Deep readiness check (backward compatible)
 * GET /health/live  — Simple liveness probe
 * GET /health/ready — Deep readiness check with database verification
 */

router.get('/', healthController.readiness);
router.get('/live', healthController.liveness);
router.get('/ready', healthController.readiness);

module.exports = router;
