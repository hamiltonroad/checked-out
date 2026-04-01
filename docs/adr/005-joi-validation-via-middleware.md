# ADR-005: Joi Validation via Middleware

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Request validation must happen before business logic runs, and validation rules should be declarative and co-located with route definitions rather than scattered across controllers.

**Decision:** Use Joi schemas defined in dedicated validator files. A generic validation middleware applies these schemas to incoming requests with the options `stripUnknown: true` and `abortEarly: false`.

- `stripUnknown: true` silently removes unexpected fields.
- `abortEarly: false` collects all validation errors in a single response.

Schemas are attached to routes as middleware, keeping controllers free of validation logic.

**Consequences:**
- Validation is declarative, testable, and separated from business logic.
- Clients receive all validation errors at once, improving developer experience.
- Unknown fields are automatically stripped, reducing attack surface.
- Joi adds a runtime dependency and requires developers to learn its schema DSL.
