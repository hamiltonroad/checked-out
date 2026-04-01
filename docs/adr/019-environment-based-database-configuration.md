# ADR-019: Environment-Based Database Configuration

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The application runs in multiple environments (development, test, production) each requiring different database connections. Test runs must not affect development data.

**Decision:** Use dotenv to load environment variables and a database configuration file that defines three profiles: development, test, and production. The test profile automatically appends `_test` to the database name, ensuring test isolation without manual configuration.

**Consequences:**
- Environment switching is controlled entirely by `NODE_ENV`.
- Test database is isolated by naming convention, preventing accidental data loss.
- Configuration lives in environment variables, not source code.
- Developers must maintain `.env` files locally (templated from `.env.example`).
