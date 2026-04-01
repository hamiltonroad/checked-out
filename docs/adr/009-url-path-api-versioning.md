# ADR-009: URL Path API Versioning

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The API needs a versioning strategy that allows future breaking changes without disrupting existing clients.

**Decision:** Use URL path-based versioning. All API routes are prefixed with `/api/v1`. Future breaking changes would introduce `/api/v2` while keeping `/api/v1` available during a transition period.

**Consequences:**
- Version is immediately visible in every request URL and in server logs.
- Easy to route different versions to different handlers or even different services.
- URLs are longer and version information is baked into client code.
- Maintaining multiple versions simultaneously increases maintenance burden.
