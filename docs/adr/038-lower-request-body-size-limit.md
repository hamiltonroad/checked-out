# ADR-038: Lower Request Body Size Limit to 1MB

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The Express body parser was configured with a 10MB limit for both JSON and URL-encoded data. This is unnecessarily large for a library management API that primarily handles small JSON payloads (book records, user data, checkout transactions). A generous limit increases the memory attack surface and allows clients to submit payloads far beyond what any endpoint requires.

**Decision:** Lower the global body size limit from 10MB to 1MB for both `express.json()` and `express.urlencoded()`. If a future route requires a larger payload (e.g., file uploads or bulk imports), add a route-specific body parser middleware with a higher limit rather than raising the global default.

**Alternatives Considered:**
- **Keep 10MB:** No change, but leaves unnecessary attack surface.
- **Lower to 100KB:** More restrictive, but could break edge cases with larger valid payloads; 1MB provides comfortable headroom.
- **Per-route limits only:** More granular, but adds complexity without clear benefit at current scale.

**Consequences:**
- Requests exceeding 1MB receive a 413 Payload Too Large response automatically from Express.
- Normal API operations are unaffected; no current endpoint approaches the 1MB threshold.
- Future routes needing larger payloads must add route-specific middleware (e.g., `router.post('/upload', express.json({ limit: '10mb' }), handler)`).
- Reduced memory exposure from malicious oversized requests.
