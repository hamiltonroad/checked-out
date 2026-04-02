# ADR-034: Standardize on Vitest for Backend and Frontend Testing

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The frontend already uses Vitest (via Vite), while the backend uses Jest. Maintaining two different test runners means two configurations, two sets of APIs, and increased onboarding friction. Vitest shares the same test API as Jest (describe, it, expect) but offers faster execution, native ESM support, and unified tooling with Vite.

**Decision:** Standardize on Vitest as the sole test runner for both backend and frontend. Remove Jest entirely from the backend.

**Key implementation details:**
- Backend test files use ESM `import` syntax (parsed as modules by Vitest) while source files remain CommonJS.
- CJS source files' `require()` calls are not intercepted by Vitest's `vi.mock()`. Instead, mocks are injected into Node's `require.cache` before loading the module under test. This approach uses `createRequire(import.meta.url)` to bridge ESM test files with CJS source modules.
- ESLint is configured with overrides for test files: `sourceType: "module"`, vitest globals, and relaxed import rules.
- The `globals: true` vitest option makes `describe`, `it`, `expect`, and `beforeEach` available without explicit imports (though test files import from `vitest` for `vi`).

**Alternatives considered:**
1. **Keep Jest for backend** — rejected because it maintains the dual-runner problem and Jest's CJS-first design increasingly conflicts with the ecosystem's ESM direction.
2. **Convert backend to ESM** — deferred; would enable cleaner `vi.mock()` usage but requires changing every source file's `require`/`module.exports` to `import`/`export`. Out of scope for this change.
3. **Use `@vitest/mocker/register`** — investigated but does not currently intercept CJS `require()` in source files loaded outside Vitest's transform pipeline.

**Consequences:**
- Single test runner across the entire monorepo reduces cognitive overhead.
- Backend tests must use the `require.cache` injection pattern for mocking CJS modules (documented in test files).
- Future ESM migration of the backend would simplify test mocking to use standard `vi.mock()`.
- The `supertest` package remains compatible and is unaffected by this change.
