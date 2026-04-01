# ADR-007: Calculated Fields via sequelize.literal()

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Certain fields (e.g., available copy counts, average ratings) are aggregates computed from related tables. Storing them would create data consistency problems; computing them in application code would require extra queries.

**Decision:** Use `sequelize.literal()` to embed SQL subqueries as virtual attributes at query time. These computed fields are included as part of the Sequelize `attributes` array so the database calculates them in a single round trip.

User-supplied values are never interpolated into `sequelize.literal()` strings. Only static SQL expressions are permitted.

**Consequences:**
- Aggregates are always consistent — no stale cached values.
- Reduces round trips by computing values inside the main query.
- Accepts MySQL dialect lock-in since literal SQL is database-specific.
- Developers must take care to never interpolate untrusted input (enforced by linting/code review).
