# ADR-022: No-Console ESLint Enforcement

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The project uses Winston for structured logging (ADR-017), and the coding standards explicitly prohibit `console.log` in production code. However, the backend ESLint configuration had `no-console: "off"`, meaning nothing prevented developers from accidentally using `console.*` calls instead of the structured logger. This gap allowed unstructured `console.error` calls to appear in production service code.

**Decision:** Set the `no-console` ESLint rule to `"error"` in the backend configuration. All existing `console.*` calls in production source code are replaced with the equivalent Winston logger methods (`logger.error`, `logger.info`, `logger.warn`). Seeder and CLI scripts that produce user-facing terminal output are exempted with file-level `eslint-disable` comments, since these scripts run interactively and structured JSON logging would harm readability.

**Alternatives considered:**
- `"warn"` severity — rejected because warnings are easily ignored and the standard is already established.
- Global override for `seeders/` directory — rejected because ESLint overrides add config complexity; a single inline disable comment is simpler and more visible.

**Consequences:**
- Any new `console.*` call in backend source code will fail the lint check, enforcing use of the structured logger.
- Developers are guided toward the Winston logger at lint time rather than during code review.
- Seeder scripts retain `console.log` for readable CLI output, clearly marked with disable comments.
- Aligns ESLint enforcement with the existing project constraint documented in CLAUDE.md.
