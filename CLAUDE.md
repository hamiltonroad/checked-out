# CLAUDE.md

## Tech Stack

Checked Out is a library management system for teaching full-stack development.
React 18 + Vite + Material UI frontend, Express + Sequelize backend, MySQL database.
3-tier architecture. Uses React Query for server state, Joi for validation.

## Architecture

- Three layers: routes -> controllers -> services -> models. Dependencies flow downward only.
- Controllers handle HTTP parsing and responses. Services contain all business logic.
- Models define Sequelize schemas and associations. No raw SQL outside models.
- Frontend: pages -> components -> hooks -> services (API calls).
- Services must not import peer services. Orchestration of multiple services belongs in the controller layer.
- Shared utilities in `backend/src/utils/` and `frontend/src/utils/`.

## Commands

- Install: `npm install` (from project root — installs all workspace dependencies)
- Dev server (both): `./scripts/start-all.sh`
- Backend only: `cd backend && npm run dev` (port 3000)
- Frontend only: `cd frontend && npm run dev` (port 5173)
- Lint: `cd backend && npm run lint` / `cd frontend && npm run lint`
- Format: `cd backend && npm run format` / `cd frontend && npm run format`
- Migrate: `cd backend && npm run db:migrate`
- Seed: `cd backend && npm run db:seed`
- Smoke test: `npm run test:smoke` (requires servers running)
- Stop services: `./scripts/stop-all.sh`

## Constraints

- Do NOT put business logic in controllers. Controllers call services. Period.
- Do NOT use console.log in production code. Use the structured logger.
- Do NOT use raw SQL queries. Use Sequelize ORM methods.
- For complex queries (GROUP BY, HAVING, subqueries), use Sequelize methods (`findAll` with `group`, `having`, `attributes` with `sequelize.fn`/`sequelize.col`, and `include` with subqueries) instead of raw SQL. See backend quick-ref for examples.
- Do NOT interpolate user-supplied values into `sequelize.literal()`. Use parameterized Sequelize methods instead.
- Do NOT commit .env files or hardcode credentials.
- Do NOT skip testing. Run lint + format before marking work complete.
- Do NOT import frontend services directly in components — use hooks.
- Source files must not exceed 200 lines (type/config files exempt).
- Test files must extract repeated setup/teardown logic into shared helpers when a block appears 3+ times.
- Every route file MUST include a Joi validator via `validateRequest` middleware. Every route reading from `req.body` MUST have a Joi `body` schema. Every route reading from `req.query` MUST have a Joi `query` schema. Every route reading from `req.params` MUST have a Joi `params` schema.
- Do NOT use `page.waitForTimeout()` in Playwright tests. Use event-based waits (`waitForSelector`, `waitForLoadState`, Locator assertions) instead.
- Endpoints that return patron PII (names, card numbers, emails) MUST use `authenticate` middleware.
- PRs with unresolved Critical or High code review findings MUST NOT be merged.
- Status and permission checks MUST test for the expected positive state (e.g., `=== 'active'`), not enumerate negative states. New statuses are denied by default.
- Auth constants (SALT_ROUNDS, token expiry) MUST be imported from `backend/src/config/auth.js` — never redefined locally.
- Do NOT add function parameters or class properties that have no consumer. If reserved for future use, add a comment referencing the planned consumer.
- Seeder files with large data arrays MUST extract arrays to `backend/src/seeders/data/` when the seeder would otherwise exceed 200 lines.
- All dev/seed passwords MUST use the same value from a single shared location.
- When a mutation hook succeeds, it MUST invalidate all query keys displaying affected data. Use React Query prefix matching.
- Shared TypeScript interfaces and types MUST be defined in one canonical location (`frontend/src/types/index.ts`) — do not redeclare types in constants or other files.
- Shared domain constants (status maps, color maps, label maps) MUST live in `frontend/src/constants/` — never duplicated across components.
- When extracting a component to its own file, migrate all applicable tests to the new component's test file — do not silently drop test coverage.
- Validators must not accept fields the controller ignores unless there is a documented migration plan with issue reference.
- Do NOT write to the database based on aggregate reads (`MAX`, `COUNT`, `MIN`) without wrapping the read+write in a serializable transaction. Use `backend/src/utils/withSerializableTransaction.js`. Race-condition tests (`*.race.test.js`) are required for any service that performs aggregate-then-write — enforced by `scripts/check-race-tests.sh` (runs as part of `npm run lint` in `backend/`).
- Do NOT use raw role string literals (`'admin'`, `'librarian'`, `'patron'`, etc.) in routes, middleware, navigation, router config, or guards. Import constants from `backend/src/config/roles.js` (`ROLES.ADMIN`) or `frontend/src/utils/roles.ts`. Enforced by ESLint.
- When implementing a feature referenced by a TODO or seam comment (e.g., "when role system is implemented"), update or remove that comment in the same PR.
- Do NOT mutate objects returned by `ApiResponse.success()` / `ApiResponse.error()`. They are frozen in non-production and mutations throw at runtime. Use a separate return shape or extend the formatter.
- Numeric literals used in multiple places or representing configuration MUST be extracted to named constants. Enforced by ESLint `no-magic-numbers` in services/hooks/pages.
- Clients MUST NOT fall back to the raw payload if `data` is missing on an ApiResponse envelope. Patterns like `response.data || response` are forbidden — trust the envelope or throw. Enforced by ESLint in `frontend/src/services/**` and `frontend/src/hooks/**`.
- The literal `'welcome123'` MUST appear ONLY in `backend/src/config/auth.js` (the canonical `DEV_PASSWORD`) and `frontend/e2e/fixtures/testData.ts` (its e2e re-export). Enforced by ESLint `no-restricted-syntax` and `scripts/check-welcome123.sh` (HARNESS-DEV-PASSWORD-LITERAL).
- ESLint rule overrides disabling `max-lines` are forbidden outside test files, type/theme/config globs, and seeders. Enforced by `scripts/check-eslint-overrides.sh` (HARNESS-MAX-LINES-OVERRIDE-GUARD).
- Environment variable defaults (e.g., `API_BASE_URL`, `VITE_API_BASE_URL`) MUST be defined once per concern and imported — not duplicated across modules. Mechanical enforcement is deferred pending an env-config refactor; reviewers MUST flag duplications during code review (HARNESS-ENV-SINGLE-SOURCE).
- `TEST_MODE` MUST never be set in development, staging, or production environments. It is set only by `scripts/e2e-test.sh` and `scripts/smoke-test.sh` during local automated test runs. The backend exits at startup if `TEST_MODE=true` and `NODE_ENV=production`.
- JSDoc `/** ... */` blocks MUST immediately precede the declaration they document — no orphaned blocks separated from their declaration by multiple blank lines. Enforced by `scripts/check-orphan-jsdoc.sh` (HARNESS-ORPHAN-JSDOC).
- Every mechanically-enforced harness rule MUST be registered in `standards/enforcement-registry.md` with a marker string. `scripts/harness-health.sh` runs in pre-commit and fails if any registered marker is missing.

## Conventions

- Backend: camelCase variables/functions, PascalCase classes, UPPER_SNAKE_CASE constants.
- Frontend: PascalCase components/files, camelCase props, handle* event handlers, use* hooks.
- All React components MUST be authored as `.tsx` files with props typed via a TypeScript `interface` or `type`. Zero-prop components use an empty interface (`interface Props {}`). Component-local prop types live in the same file as the component unless shared across 3+ consumers, in which case they belong in `frontend/src/types/index.ts`. Importing from `prop-types` is forbidden — enforced by ESLint (HARNESS-NO-PROP-TYPES, issue #231).
- Use Material UI theme tokens — no inline `style` objects or inline color, spacing, or typography values in MUI components. Use the `sx` prop or `styled()` with theme tokens.
- API responses use `ApiResponse.success()` / `ApiResponse.error()` wrappers.
- Sequelize models use `underscored: true` and `timestamps: true`.
- Use JavaScript default parameters for default prop values on function components (`defaultProps` is deprecated in React 18.3+).
- Error handling: try/catch in controllers, throw typed errors from services.
- Shared formatting functions (dates, currency, names) MUST live in `frontend/src/utils/` — never defined inline in components.

## Context Guidance

- Backend code: `backend/src/` — see [backend-quick-ref.md](standards/quick-ref/backend-quick-ref.md)
- Frontend code: `frontend/src/` — see [frontend-quick-ref.md](standards/quick-ref/frontend-quick-ref.md)
- Craftsmanship: [craftsmanship-quick-ref.md](standards/quick-ref/craftsmanship-quick-ref.md)
- UX standards: [ux-quick-ref.md](standards/quick-ref/ux-quick-ref.md) (full: [ux-standards.md](standards/full/ux-standards.md))
- Database guide: [database-guide.md](standards/quick-ref/database-guide.md)
- Testing guide: [testing-guide.md](standards/quick-ref/testing-guide.md)
- E2E pyramid (smoke / flow / security): `frontend/e2e/README.md` — see "Pyramid E2E Layers" in [testing-guide.md](standards/quick-ref/testing-guide.md)
- E2E testing rules (waiting, selectors, fixtures, seeding, assertions): [e2e-testing.md](standards/e2e-testing.md) — required reading before touching `frontend/e2e/**`
- Code review standard: [code-review.md](standards/code-review.md)
- Config: `backend/.env` (DB creds), `frontend/.env` (API URL), `backend/src/config/database.js`
- Tech stack reference: [tech-stack-quick-ref.md](standards/quick-ref/tech-stack-quick-ref.md)
- Enterprise patterns: [enterprise-patterns-quick-ref.md](standards/quick-ref/enterprise-patterns-quick-ref.md)
- Harness infrastructure: [harness.md](harness.md) (agents, commands, knowledge base, full standards, verification docs)

## Session Guidance

- **Context compaction:** Before compaction, persist important state to `.claude/temp/` files so it survives context resets. See [context-management-kit.md](knowledge/context-management-kit.md).
- **Sub-agent scoping:** Sub-agents should read CLAUDE.md and only the standards relevant to their task. Pass focused instructions, not the entire knowledge base. See [subagents-kit.md](knowledge/subagents-kit.md).
- **Cross-agent handoff:** Use `.claude/temp/` files (e.g., `PLAN-<number>-REMOVE.md`, `VERIFICATION-<number>-REMOVE.md`) to pass context between agents in a workflow.
- **Agent operations:** See [agent-operations-kit.md](knowledge/agent-operations-kit.md) for lifecycle, error handling, and reporting patterns.
