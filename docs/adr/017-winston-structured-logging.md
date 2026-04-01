# ADR-017: Winston Structured Logging

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The backend needs structured, queryable logs for debugging and monitoring. `console.log` is unstructured and cannot be easily filtered or aggregated.

**Decision:** Use Winston as the logging library with JSON-formatted output. Morgan HTTP request logging is piped into Winston so all log output flows through a single channel. Logging is disabled in the test environment to keep test output clean.

Production code must not use `console.log` — only the Winston logger instance.

**Consequences:**
- All logs are structured JSON, enabling machine parsing and log aggregation.
- Single logging pipeline simplifies configuration and output routing.
- Test runs are not polluted with log noise.
- Developers must import and use the logger rather than `console.log`.
