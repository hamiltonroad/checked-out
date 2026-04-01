# ADR-020: Sequelize Migrations with Timestamp Naming

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Database schema changes must be versioned, repeatable, and ordered. Multiple developers working in parallel need a conflict-resistant naming strategy.

**Decision:** Use the Sequelize CLI for migrations with timestamp-prefixed filenames (e.g., `20260101120000-create-books.js`). Seeders follow the same pattern and provide demo data for development. Migrations run via `npm run db:migrate` and seeders via `npm run db:seed`.

**Consequences:**
- Timestamp prefixes provide natural ordering and minimize naming conflicts.
- Migrations are reversible and version-controlled alongside application code.
- Seeders provide consistent demo data for development and testing.
- All developers must use the CLI to generate migrations rather than hand-creating files.
