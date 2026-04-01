# ADR-025: Deep Health Check with Database Connectivity

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The existing `/health` endpoint returns `{ status: "ok" }` without verifying database connectivity. Load balancers and monitoring systems receive false positives when the database is down but the application process is still running. Production environments need reliable health signals to make routing and alerting decisions.

**Decision:** Split the health check into two endpoints following the Kubernetes liveness/readiness probe convention:

- **`/health/live`** — Lightweight liveness probe. Confirms the application process is running and can accept HTTP requests. No dependency checks. Always returns `200` unless the process is unresponsive.
- **`/health/ready`** — Deep readiness probe. Calls `sequelize.authenticate()` with a 5-second timeout to verify database connectivity. Returns `200` with `status: "ok"` when healthy, or `503` with `status: "degraded"` when the database is unreachable.
- **`/health`** — Backward-compatible alias for `/health/ready`.

Implementation follows the existing layered architecture:
- `HealthService` encapsulates the database check with timeout logic.
- `HealthController` maps HTTP semantics to service calls.
- `healthRoutes` defines the Express routes.

All responses use the standard `ApiResponse.success()` wrapper for consistency.

**Alternatives considered:**
1. **Single enhanced `/health` endpoint** — Simpler but conflates liveness and readiness. Load balancers that only need liveness would incur unnecessary DB round-trips on every probe.
2. **Database check in middleware** — Would run on every request, not just health probes. Unacceptable performance impact.
3. **External health check service** — Adds infrastructure complexity without clear benefit for this application's scale.

**Consequences:**
- Load balancers can use `/health/live` for fast liveness checks and `/health/ready` for traffic routing decisions.
- Monitoring systems get accurate database connectivity status.
- The 5-second timeout prevents health checks from hanging when the database is slow or unreachable.
- The `503` status code on degraded health allows load balancers to automatically remove unhealthy instances.
- Adds a small overhead to readiness checks (one `SELECT 1` query per probe).
