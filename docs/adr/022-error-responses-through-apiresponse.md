# ADR-022: Error Responses Through ApiResponse

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The centralized error-handling middleware (`errorHandler.js`) constructed its own JSON response object directly, bypassing the `ApiResponse` utility that all success responses already use. This created an inconsistency: success responses followed the `{ success, message, data }` envelope while error responses used a slightly different, hand-built shape. Frontend consumers had to account for two response structures.

**Decision:** Route all error responses through `ApiResponse.error()`, the same utility used for success responses. The error handler now calls `ApiResponse.error(message, statusCode, extras)` instead of building raw JSON. The optional `extras` parameter allows development-only fields like `stack` to be included without polluting production responses.

The error envelope is:

```json
{ "success": false, "message": "...", "statusCode": 500 }
```

In development mode, a `stack` field is appended for debugging.

**Alternatives Considered:**
- **Keep hand-built JSON in errorHandler** — rejected because it duplicates envelope logic and risks drift between success and error shapes.
- **Create a separate ErrorResponse class** — rejected because ApiResponse already supports both cases and a second class adds unnecessary complexity.

**Consequences:**
- All API responses — success and error — share the same utility and envelope structure.
- Frontend code can rely on `response.data.message` uniformly for both success and error cases.
- The `statusCode` field appears in the error response body (in addition to the HTTP status) for convenience during debugging.
- Future changes to the response envelope only need to happen in one place (`ApiResponse`).
