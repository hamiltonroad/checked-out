# ADR-025: Comprehensive Graceful Shutdown

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The backend server had a minimal SIGTERM handler that only closed the HTTP server. There was no SIGINT handling (Ctrl+C during development), no cleanup of the Sequelize connection pool, no shutdown timeout, and no explicit exit codes. In production, this could leave orphaned database connections and cause connection pool exhaustion on restarts.

**Decision:** Implement a comprehensive graceful shutdown sequence in a dedicated utility module (`backend/src/utils/gracefulShutdown.js`) that:

1. Handles both SIGTERM and SIGINT signals.
2. Closes the HTTP server to stop accepting new connections while in-flight requests finish.
3. Closes the Sequelize connection pool via `sequelize.close()`.
4. Enforces a 10-second timeout that force-exits (code 1) if cleanup takes too long.
5. Exits with code 0 on clean shutdown, code 1 on error or timeout.
6. Is idempotent — duplicate signals during shutdown are safely ignored.
7. Logs every step using the project's structured Winston logger.

**Alternatives considered:**

- **Keep the minimal handler:** Rejected because it leaks database connections and provides no feedback during shutdown.
- **Use a third-party library (e.g., `terminus`):** Rejected to avoid an external dependency for a straightforward requirement; the custom implementation is under 90 lines and fully testable.
- **Handle shutdown in `app.js`:** Rejected because `app.js` defines the Express application and should not own process lifecycle concerns. Keeping shutdown in a utility called from `server.js` respects the separation of concerns.

**Consequences:**
- Database connections are properly released on every shutdown path.
- Developers get clean Ctrl+C behavior during local development.
- Hung shutdown is bounded by a 10-second timeout, preventing zombie processes.
- The idempotency guard prevents double-shutdown race conditions.
- The utility is reusable if additional cleanup steps (e.g., cache flush, queue drain) are needed in the future.
