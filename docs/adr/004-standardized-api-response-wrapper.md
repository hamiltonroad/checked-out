# ADR-004: Standardized ApiResponse Wrapper

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Frontend consumers need a predictable response shape so they can handle success and error cases uniformly without inspecting status codes or guessing payload structure.

**Decision:** All successful API responses use the `ApiResponse` utility, which returns a consistent envelope:

```json
{ "success": true, "message": "...", "data": { ... } }
```

Controllers call `ApiResponse.success(res, data, message, statusCode)` to send responses. Error responses follow the same shape via the error middleware.

**Consequences:**
- Frontend code can rely on a single response shape for all endpoints.
- Simplifies client-side error handling and data extraction.
- Every controller must use the wrapper — returning raw objects is not permitted.
- Slightly increases payload size due to the envelope overhead.
