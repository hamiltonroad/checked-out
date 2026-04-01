# ADR-003: Custom ApiError Class with HTTP Semantics

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Services need to signal error conditions without coupling to HTTP. Controllers and error-handling middleware need a consistent way to translate business errors into proper HTTP responses.

**Decision:** Use a custom `ApiError` class that extends `Error` and carries an HTTP status code. Factory methods provide semantic construction:

- `ApiError.badRequest(message)` — 400
- `ApiError.notFound(message)` — 404
- `ApiError.conflict(message)` — 409

Services throw `ApiError` instances. Controllers catch them, and the centralized error-handling middleware formats the final HTTP response.

**Consequences:**
- Services communicate error intent without importing Express.
- Error handling is centralized in one middleware, reducing duplication.
- New error types require only a new factory method.
- All layers must agree to use `ApiError` rather than ad-hoc error objects.
