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

## Conventions

- Backend: camelCase variables/functions, PascalCase classes, UPPER_SNAKE_CASE constants.
- Frontend: PascalCase components/files, camelCase props, handle* event handlers, use* hooks.
- All React components must define PropTypes — including zero-prop components (use empty `{}`). Use `shape()` for objects and `arrayOf(shape())` for arrays — never raw `object` or `array`.
- Use Material UI theme tokens — no inline `style` objects or inline color, spacing, or typography values in MUI components. Use the `sx` prop or `styled()` with theme tokens.
- API responses use `ApiResponse.success()` / `ApiResponse.error()` wrappers.
- Sequelize models use `underscored: true` and `timestamps: true`.
- Use JavaScript default parameters instead of `defaultProps` for function components (`defaultProps` is deprecated in React 18.3+).
- Error handling: try/catch in controllers, throw typed errors from services.
- Shared formatting functions (dates, currency, names) MUST live in `frontend/src/utils/` — never defined inline in components.

## Context Guidance

- Backend code: `backend/src/` — see [backend-quick-ref.md](standards/quick-ref/backend-quick-ref.md)
- Frontend code: `frontend/src/` — see [frontend-quick-ref.md](standards/quick-ref/frontend-quick-ref.md)
- Craftsmanship: [craftsmanship-quick-ref.md](standards/quick-ref/craftsmanship-quick-ref.md)
- Database guide: [database-guide.md](standards/quick-ref/database-guide.md)
- Testing guide: [testing-guide.md](standards/quick-ref/testing-guide.md)
- Code review standard: [code-review.md](standards/code-review.md)
- Config: `backend/.env` (DB creds), `frontend/.env` (API URL), `backend/src/config/database.js`
- Tech stack reference: [tech-stack-quick-ref.md](standards/quick-ref/tech-stack-quick-ref.md)
- Enterprise patterns: [enterprise-patterns-quick-ref.md](standards/quick-ref/enterprise-patterns-quick-ref.md)
- Full standards: `standards/full/` (detailed versions of the quick-ref guides)
- Agent definitions: `.claude/agents/` (agent configurations for the harness workflow)
- Knowledge base: `knowledge/` (deep-dive references on architecture, context management, sub-agents, and more)
- Slash commands: `.claude/commands/` — use `/story-runner <number>` for agent-based workflow
- Verification docs: `.claude/temp/VERIFICATION-<number>-REMOVE.md`

## Session Guidance

- **Context compaction:** Before compaction, persist important state to `.claude/temp/` files so it survives context resets. See [context-management-kit.md](knowledge/context-management-kit.md).
- **Sub-agent scoping:** Sub-agents should read CLAUDE.md and only the standards relevant to their task. Pass focused instructions, not the entire knowledge base. See [subagents-kit.md](knowledge/subagents-kit.md).
- **Cross-agent handoff:** Use `.claude/temp/` files (e.g., `PLAN-<number>-REMOVE.md`, `VERIFICATION-<number>-REMOVE.md`) to pass context between agents in a workflow.
- **Agent operations:** See [agent-operations-kit.md](knowledge/agent-operations-kit.md) for lifecycle, error handling, and reporting patterns.
