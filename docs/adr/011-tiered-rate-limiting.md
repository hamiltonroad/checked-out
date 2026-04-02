# ADR-011: Tiered Rate Limiting

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The application used a single global rate limit (100 requests per 15 minutes) applied uniformly to all `/api` routes. This one-size-fits-all approach penalises read-heavy browsing (catalogue searches, book detail views) while providing insufficient protection for write operations and authentication endpoints that are more susceptible to abuse.

**Decision:** Replace the global rate limiter with two tiers applied at the route level:

| Tier     | Max Requests | Window   | Applies To                          |
|----------|-------------|----------|-------------------------------------|
| Standard | 200         | 15 min   | GET / read-only endpoints           |
| Strict   | 20          | 15 min   | POST, PUT, DELETE, and auth routes  |

Implementation details:

- A `rateLimiter` middleware module (`backend/src/middlewares/rateLimiter.js`) exports pre-configured `standardLimiter` and `strictLimiter` instances plus a `createRateLimiter` factory for custom tiers.
- Rate limiters are applied per-route in each route file rather than globally in `app.js`.
- Health-check routes (`/health`) are excluded from rate limiting.
- Standard `RateLimit` response headers follow the IETF `draft-7` specification (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`). Legacy `X-RateLimit-*` headers are disabled.

**Alternatives Considered:**

1. **Per-user rate limiting (JWT-based):** More granular but requires authentication on all routes; deferred until auth is mandatory.
2. **Three-tier system (read / write / auth):** Adds complexity with marginal benefit given current route count; can be introduced later.
3. **External rate limiting (API gateway / reverse proxy):** Out of scope for the application layer; may complement this approach in production.

**Consequences:**

- Read-heavy clients (e.g., catalogue browsing) get a 4x increase in allowed requests.
- Write and auth endpoints are protected with a stricter threshold, reducing abuse surface.
- Adding a new route requires the developer to choose and apply the correct tier — enforced via code review.
- The factory pattern allows introducing additional tiers (e.g., for admin or batch endpoints) without changing existing code.
