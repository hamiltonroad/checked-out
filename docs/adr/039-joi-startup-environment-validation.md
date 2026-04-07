# ADR-039: Joi Startup Environment Validation

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The backend application reads environment variables (`DB_HOST`, `DB_PORT`, `JWT_SECRET`, etc.) throughout its codebase but never validates their presence or format at startup. When a required variable like `DB_HOST` is missing, the application boots successfully but fails on the first database call with an opaque Sequelize connection error. Developers and operators must then reverse-engineer which variable is missing — a poor experience that slows onboarding and delays incident response.

**Decision:** Add a Joi-based environment validation step (`backend/src/config/envValidator.js`) that runs at the very top of `server.js`, before the Express app or Sequelize models are loaded. The module:

1. Defines a Joi schema covering every environment variable used by the application, marking each as required or optional with appropriate defaults and type coercion.
2. Validates `process.env` with `abortEarly: false` and `allowUnknown: true` so that (a) all problems are reported in a single pass and (b) system-level env vars are not rejected.
3. On failure, logs every validation error via the structured Winston logger and exits with code 1.
4. On success, returns the validated values with defaults applied.

The `.env.example` file is kept in sync with the schema so that developers always have a complete template.

**Alternatives considered:**

- **Manual checks with `if (!process.env.X)` guards:** Rejected because guards are scattered, easy to forget when adding new variables, and report only one missing variable at a time.
- **Use a dedicated config library (e.g., `convict`, `envalid`):** Rejected to avoid adding a new dependency when Joi is already in the project for request validation; reusing Joi keeps the validation approach consistent across the codebase.
- **Validate inside `config/database.js`:** Rejected because only database variables would be covered; application-wide variables like `JWT_SECRET` and `PORT` would still be unvalidated.

**Consequences:**
- Missing or invalid environment variables are caught immediately at startup with a clear, consolidated error message.
- Developers onboarding to the project get actionable feedback instead of cryptic database errors.
- The Joi schema serves as living documentation of every env var the application uses.
- Adding a new env var requires updating both the schema and `.env.example`, enforcing discipline.
- The validation module is unit-testable in isolation, with tests covering required fields, defaults, and invalid values.
