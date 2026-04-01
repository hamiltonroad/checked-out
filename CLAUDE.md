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

- Install: `cd backend && npm install` / `cd frontend && npm install`
- Dev server (both): `./scripts/start-all.sh`
- Backend only: `cd backend && npm run dev` (port 3000)
- Frontend only: `cd frontend && npm run dev` (port 5173)
- Lint: `cd backend && npm run lint` / `cd frontend && npm run lint`
- Format: `cd backend && npm run format` / `cd frontend && npm run format`
- Migrate: `cd backend && npm run db:migrate`
- Seed: `cd backend && npm run db:seed`
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

## Conventions

- Backend: camelCase variables/functions, PascalCase classes, UPPER_SNAKE_CASE constants.
- Frontend: PascalCase components/files, camelCase props, handle* event handlers, use* hooks.
- All React components must define PropTypes.
- Use Material UI theme tokens — no inline color or spacing values.
- API responses use `ApiResponse.success()` / `ApiResponse.error()` wrappers.
- Sequelize models use `underscored: true` and `timestamps: true`.
- Use JavaScript default parameters instead of `defaultProps` for function components (`defaultProps` is deprecated in React 18.3+).
- Error handling: try/catch in controllers, throw typed errors from services.

## Context Guidance

- Backend code: `backend/src/` — see [backend-quick-ref.md](standards/quick-ref/backend-quick-ref.md)
- Frontend code: `frontend/src/` — see [frontend-quick-ref.md](standards/quick-ref/frontend-quick-ref.md)
- Craftsmanship: [craftsmanship-quick-ref.md](standards/quick-ref/craftsmanship-quick-ref.md)
- Database guide: [database-guide.md](standards/quick-ref/database-guide.md)
- Testing guide: [testing-guide.md](standards/quick-ref/testing-guide.md)
- Code review standard: [code-review.md](standards/code-review.md)
- Config: `backend/.env` (DB creds), `frontend/.env` (API URL), `backend/src/config/database.js`
- Slash commands: `.claude/commands/` — use `/story-runner <number>` for agent-based workflow
- Verification docs: `.claude/temp/VERIFICATION-<number>-REMOVE.md`
