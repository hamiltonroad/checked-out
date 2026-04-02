# ADR-028: Standardized Validation Error Format

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The backend had two inconsistent validation error formats. The `validateRequest` middleware (used by book and checkout validators) joined Joi error details into a flat comma-separated string. The rating validator used its own inline middleware that returned field-level error objects (`{ field, message }`). This inconsistency made frontend error handling harder and prevented field-specific error display.

**Decision:** Standardize all validation errors to return field-level error objects in the format:

```json
{
  "success": false,
  "message": "Validation error",
  "statusCode": 400,
  "errors": [
    { "field": "rating", "message": "\"rating\" must be greater than or equal to 1" },
    { "field": "bookId", "message": "\"bookId\" is required" }
  ]
}
```

Implementation details:

- `ApiError` accepts an optional `errors` array, propagated through the error handler.
- `validateRequest` middleware maps Joi `error.details` to `[{ field, message }]` objects.
- All validators use the schema-based pattern with `validateRequest` (no inline validation middleware).
- Frontend uses `errorUtils.js` helpers (`parseApiError`, `getFieldError`, `formatApiError`) to parse responses.
- The top-level `message` field is always present for backward compatibility.

**Alternatives considered:**

1. *Keep flat strings:* Simple but prevents field-level error display in the UI.
2. *Nest errors under a `validation` key:* More structured but adds unnecessary nesting.
3. *Return errors as a map (`{ field: message }`:* Doesn't support multiple errors per field.

**Consequences:**

- All validation errors follow one format, simplifying frontend error handling.
- Frontend can display field-specific error messages next to form inputs.
- The `message` field remains present, so consumers that only read `message` continue to work.
- The rating validator now uses the same `validateRequest` middleware as all other validators, reducing code duplication.
- Joi's `abortEarly: false` setting ensures all field errors are returned in a single response.
