# ADR-021: Middleware Ordering

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Express middleware executes in registration order. Security, parsing, and logging middleware must run before route handlers; error handling must run after. Incorrect ordering causes subtle bugs or security gaps.

**Decision:** Middleware is registered in this fixed order:

1. **Helmet** — security headers
2. **CORS** — cross-origin policy
3. **Rate limiter** — throttle abusive clients
4. **Body parser** — parse JSON/URL-encoded bodies
5. **Morgan** — HTTP request logging (piped to Winston)
6. **Health check** — `/health` endpoint (before auth)
7. **API routes** — versioned route handlers
8. **404 handler** — catch unmatched routes
9. **Error handler** — format and return error responses

**Consequences:**
- Security middleware runs before any request processing.
- Rate limiting rejects abusive traffic before body parsing.
- Logging captures all requests, including those rejected by routes.
- Health checks bypass authentication, enabling load-balancer probes.
- The ordering must be maintained as new middleware is added.
