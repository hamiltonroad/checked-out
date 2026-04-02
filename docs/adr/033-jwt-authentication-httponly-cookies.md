# ADR-033: JWT Authentication in httpOnly Cookies

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The application previously used a development-only `X-Patron-Id` header for authentication. This approach is easily spoofable and unsuitable for production. A secure, stateless authentication mechanism is needed that protects against common web vulnerabilities (XSS, CSRF).

**Decision:** Adopt JWT (JSON Web Token) authentication with tokens stored in httpOnly cookies. The system uses a dual-token approach:

- **Access token** — short-lived (15 min), stored in an httpOnly cookie sent on all requests. Used for request authentication.
- **Refresh token** — long-lived (7 days), stored in an httpOnly cookie scoped to `/api/v1/auth`. Used only to rotate the token pair.
- **CSRF protection** — double-submit cookie pattern. A non-httpOnly `_csrf` cookie is set by the server; the client reads it and sends it back as an `X-CSRF-Token` header on state-changing requests.
- **Dev fallback** — the `X-Patron-Id` header is still accepted when `NODE_ENV=development`, allowing existing local development workflows to continue.

**Alternatives considered:**

1. **Session-based auth with server-side store** — rejected because it adds server state and complicates horizontal scaling.
2. **JWT in localStorage** — rejected because localStorage is accessible to JavaScript and vulnerable to XSS token theft.
3. **JWT in Authorization header only** — rejected because it requires client-side token storage (localStorage or memory), reintroducing XSS risk.
4. **OAuth 2.0 / OpenID Connect** — rejected as over-engineered for a library management system with a single patron type.

**Consequences:**

- Tokens are inaccessible to client-side JavaScript, mitigating XSS-based token theft.
- CSRF protection is required for all state-changing endpoints (POST, PUT, DELETE).
- Token refresh happens transparently; patrons stay logged in for up to 7 days.
- The Patron model gains a `password_hash` column; passwords are hashed with bcrypt (12 rounds).
- Frontend must send `withCredentials: true` on all API requests for cookies to be included.
- CORS must be configured with explicit origins (no wildcards) when credentials are enabled.
- The existing dev-mode header fallback is retained behind a `NODE_ENV` check, preserving backward compatibility for local development and testing.
