# ADR-030: CORS Environment Configuration

**Status:** Accepted
**Date:** 2026-04-01

**Context:** CORS allowed origins were hardcoded in `app.js` to three localhost ports (5173, 5174, 5175). This was inflexible for developers using git worktrees on different ports and required code changes to modify the allowed origin list. Other configuration values (database, JWT) were already read from environment variables.

**Decision:** CORS origins are read from the `CORS_ORIGINS` environment variable. The value is a comma-separated list of origins, with each entry trimmed of whitespace. When the variable is not set, the application falls back to sensible development defaults (`http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`). The parsing logic lives in `backend/src/config/cors.js`, keeping `app.js` focused on middleware registration order.

**Alternatives considered:**
- *Single origin variable (`CORS_ORIGIN`):* Too restrictive for multi-port worktree setups.
- *Wildcard (`*`):* Insecure; defeats the purpose of CORS.
- *JSON array in env var:* Harder to author in `.env` files; comma-separated is the simpler convention.

**Consequences:**
- Developers can add or remove allowed origins without changing source code.
- The `.env.example` file documents the variable and its default value.
- The default fallback ensures the app works out of the box for local development.
- Production deployments must set `CORS_ORIGINS` explicitly to their domain(s).
