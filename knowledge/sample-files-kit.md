# Sample Files

Reference examples of well-built harness components. The CLI uses these as templates and comparison targets.

## Example CLAUDE.md: TypeScript/React (41 lines)

```markdown
# CLAUDE.md

## Overview

React 18 SPA with TypeScript. Uses Vite for builds, Zustand for state
management, React Query for server state. Talks to a REST API at /api.

## Build & Test

- Install: `npm install`
- Dev server: `npm run dev` (port 5173)
- Tests: `npm test` (Vitest)
- Single test: `npx vitest run path/to/test.ts`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`
- Build: `npm run build`

## Project Structure

- src/features/ — Feature modules (each has components/, hooks/, api/)
- src/shared/ — Shared components, hooks, utilities
- src/config/ — App configuration and constants
- src/types/ — Shared TypeScript types
- tests/ — Mirrors src/ structure

## Conventions

- Components: PascalCase files and function names. One component per file.
- Hooks: camelCase, prefixed with `use`. Custom hooks in hooks/ directory.
- Named exports only. No default exports.
- Use `cn()` utility from src/shared/utils for combining CSS classes.
- Forms use react-hook-form with zod schemas for validation.
- API calls go through React Query hooks in feature's api/ directory.

## Architecture

- Feature modules are self-contained. No cross-feature imports.
- Shared code goes in src/shared/. If two features need it, it's shared.
- State: local with useState, shared with Zustand stores,
  server state with React Query. Never mix these.
- Route definitions live in src/routes.tsx. One entry per feature.

## Do NOT

- Do NOT use `any` type. Use `unknown` and narrow, or define a proper type.
- Do NOT put API URLs as string literals. Use constants from src/config/api.ts.
- Do NOT manipulate the DOM directly. Use refs when necessary.
- Do NOT create new Zustand stores without discussing scope first.
- Do NOT use index files (index.ts) for re-exports. Import directly.
```

## Example CLAUDE.md: Python/FastAPI (38 lines)

```markdown
# CLAUDE.md

## Overview

FastAPI REST API with SQLAlchemy ORM and PostgreSQL. Serves a React
frontend. Uses Alembic for migrations. Python 3.12+.

## Build & Test

- Setup: `pip install -e ".[dev]"` (use virtual env)
- Tests: `pytest` (all) or `pytest tests/test_specific.py` (single)
- Lint: `ruff check .` (fix: `ruff check --fix .`)
- Format: `ruff format .`
- Type check: `mypy src/`
- Run server: `uvicorn src.main:app --reload`
- Migrations: `alembic upgrade head` (apply),
  `alembic revision --autogenerate -m "description"` (create)

## Structure

- src/domains/ — Business domains (users/, billing/, projects/)
- src/domains/\*/models.py — SQLAlchemy models
- src/domains/\*/schemas.py — Pydantic request/response schemas
- src/domains/\*/router.py — FastAPI route definitions
- src/domains/\*/service.py — Business logic
- src/domains/\*/repository.py — Database queries
- src/core/ — Shared config, deps, exceptions, middleware

## Conventions

- Type hints on all function signatures. No bare `dict` or `list`.
- Pydantic models for all API inputs and outputs. Never return raw dicts.
- Dependency injection via FastAPI `Depends()` for DB sessions and auth.
- Exceptions: raise from src/core/exceptions.py. Never return error dicts.
- Tests: use pytest fixtures. Factories in tests/factories.py.

## Do NOT

- Do NOT use raw SQL. Use SQLAlchemy ORM methods via the repository.
- Do NOT access `request.state` directly. Use dependency injection.
- Do NOT create circular imports between domains. Use events or shared schemas.
- Do NOT write business logic in router.py. Routers call services. Period.
- Do NOT use `from src.domains.users.models import User` in another domain.
```

## Example CLAUDE.md: Monorepo Root (28 lines)

```markdown
# CLAUDE.md

## Overview

Monorepo managed with Turborepo. Three packages: web (React), api
(Express), and shared (common types and utilities).

## Build & Test

- Install: `npm install` (from root — workspaces handle packages)
- Build all: `npx turbo build`
- Test all: `npx turbo test`
- Build one: `npx turbo build --filter=@project/api`
- Test one: `npx turbo test --filter=@project/web`
- Lint all: `npx turbo lint`

## Structure

- packages/web/ — React frontend (see packages/web/CLAUDE.md)
- packages/api/ — Express backend (see packages/api/CLAUDE.md)
- packages/shared/ — Shared types, validators, constants
- turbo.json — Pipeline configuration

## Cross-Package Rules

- packages/shared/ is the ONLY package others can import from.
- web and api must NEVER import from each other.
- Shared types go in packages/shared/src/types/.
- When changing shared types, run `npx turbo build` to verify downstream.
- All cross-package imports use @project/ scope: `@project/shared`.

## Git

- Branches: feature/package-name/description
- Commits: type(package): description (e.g., feat(api): add user endpoint)
- Run `npx turbo test --filter=...` for affected packages before committing.
```

## Example Subdirectory CLAUDE.md (11 lines)

```markdown
# packages/api/CLAUDE.md

## API-Specific Rules

- Express routes go in src/routes/. One file per resource.
- Middleware goes in src/middleware/. Auth middleware is already set up.
- Database access: use Prisma client from src/db/client.ts.
- Response format: always use helpers from src/utils/response.ts.
  Never send raw `res.json()`.
- Error handling: throw from src/errors/. Error middleware catches them.
- Migrations: `npx prisma migrate dev --name description`
- Generate types after schema changes: `npx prisma generate`
```

## Example Personal ~/.claude/CLAUDE.md (10 lines)

```markdown
# ~/.claude/CLAUDE.md

## Personal Preferences

- Use conventional commits: type(scope): description
- Run tests before telling me a task is complete.
- Prefer explicit return types on exported functions.
- Prefer functional patterns over class-based unless codebase uses classes.
- Do not create README.md or documentation files unless I ask.
- Do not add comments explaining obvious code. Only comment the "why."
- When I say "refactor," I mean restructure without changing behavior.
- Keep git diffs minimal. Don't reformat files you didn't need to change.
```

## Example .claude/settings.json (Complete)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Edit",
      "Write",
      "Bash(npm test*)",
      "Bash(npm run lint*)",
      "Bash(npm run build*)",
      "Bash(npx tsc*)",
      "Bash(git status*)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add*)",
      "Bash(git commit*)",
      "Bash(ls *)",
      "Bash(curl http://localhost*)"
    ],
    "deny": [
      "Bash(curl*POST*)",
      "Bash(rm -rf*)",
      "Bash(npm publish*)",
      "Bash(docker*)",
      "Bash(ssh*)",
      "Read(**/.env*)",
      "Read(~/.ssh/*)",
      "Read(~/.aws/*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "write_to_file",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'BLOCKED=\".env .env.local package-lock.json\"; for f in $BLOCKED; do if [[ \"$CLAUDE_FILE_PATH\" == *\"$f\" ]]; then echo \"BLOCKED: $f is protected.\" >&2; exit 1; fi; done'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "write_to_file",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'if [[ \"$CLAUDE_FILE_PATH\" == *.ts ]]; then npx tsc --noEmit 2>&1 | grep -E \"^src/.*error TS\" | head -15; fi'"
          },
          {
            "type": "command",
            "command": "bash -c 'if [[ \"$CLAUDE_FILE_PATH\" == *.ts ]] || [[ \"$CLAUDE_FILE_PATH\" == *.js ]]; then npx eslint --fix \"$CLAUDE_FILE_PATH\" --format compact 2>&1 | head -20; fi'"
          },
          {
            "type": "command",
            "command": "bash -c 'if grep -nEi \"(api_key|secret|password|token)\\s*[:=]\\s*[\\x27\\\"][A-Za-z0-9]{8,}\" \"$CLAUDE_FILE_PATH\" 2>/dev/null; then echo \"Possible hardcoded secret.\" >&2; exit 1; fi'"
          }
        ]
      }
    ]
  }
}
```

## Example .harness/architecture.json

```json
{
  "version": "1.0",
  "layers": {
    "presentation": {
      "path": "src/routes/",
      "description": "HTTP route handlers — parse request, delegate, format response",
      "canDependOn": ["application"]
    },
    "application": {
      "path": "src/services/",
      "description": "Use cases and business logic orchestration",
      "canDependOn": ["domain", "infrastructure"]
    },
    "domain": {
      "path": "src/domain/",
      "description": "Business rules, entities, value objects — zero external dependencies",
      "canDependOn": []
    },
    "infrastructure": {
      "path": "src/repositories/",
      "description": "Database access and external API clients",
      "canDependOn": ["domain"]
    }
  },
  "domains": {
    "users": "src/features/users/",
    "billing": "src/features/billing/",
    "notifications": "src/features/notifications/"
  },
  "crossDomainRule": "No direct cross-domain imports. Use shared/interfaces/.",
  "sharedPath": "src/shared/",
  "bannedPatterns": [
    {
      "pattern": "db\\.query|\\.(execute|raw)\\(",
      "excludePaths": ["src/repositories/", "src/config/", "migrations/"],
      "message": "Direct database queries must go through repository layer",
      "severity": "critical"
    },
    {
      "pattern": "process\\.env",
      "excludePaths": ["src/config/"],
      "message": "Access environment variables through src/config/ only",
      "severity": "important"
    },
    {
      "pattern": "console\\.log",
      "excludePaths": ["scripts/", "tests/"],
      "message": "Use structured logger from src/shared/logger instead",
      "severity": "recommended"
    },
    {
      "pattern": "TODO|FIXME|HACK",
      "excludePaths": [],
      "message": "Track issues in issue tracker, not code comments",
      "severity": "recommended"
    }
  ],
  "fileRules": {
    "maxLines": 300,
    "namingConvention": "kebab-case",
    "typeSuffixes": {
      "service": ".service.ts",
      "repository": ".repository.ts",
      "routes": ".routes.ts",
      "types": ".types.ts",
      "test": ".test.ts"
    }
  }
}
```

## Example Progress File

```markdown
# Progress

## Last Updated

2026-03-18, Session 3

## Completed This Session

- Implemented login endpoint (src/routes/auth.ts)
- Added JWT token generation (src/services/auth-service.ts)
- Wired up password hashing with bcrypt
- Login tests passing (tests/unit/auth-login.test.ts)

## Next Session Should

- Implement password reset flow (email + token)
- Add rate limiting to auth endpoints
- Wire up real SMTP via SendGrid (API key in .env)

## Decisions Made

- JWT tokens expire after 1 hour (short-lived for security)
- Login returns { token, expiresIn } — no user profile in response
- Refresh tokens deferred — MVP uses re-login

## Known Issues

- None. Codebase is green.
```

## Example Architecture Linter Script

```bash
#!/bin/bash
# scripts/check-architecture.sh
ERRORS=0

# No database calls outside repositories
DB_VIOLATIONS=$(grep -rn "db\.\|\.query(\|\.execute(" src/ \
  | grep -v "src/repositories/" \
  | grep -v "src/config/" || true)
if [ -n "$DB_VIOLATIONS" ]; then
    echo "ERROR: Database queries found outside repository layer:"
    echo "$DB_VIOLATIONS"
    echo "FIX: Move database queries to the appropriate repository."
    ERRORS=$((ERRORS + 1))
fi

# No direct env access outside config
ENV_VIOLATIONS=$(grep -rn "process\.env" src/ \
  | grep -v "src/config/" || true)
if [ -n "$ENV_VIOLATIONS" ]; then
    echo "ERROR: Direct environment variable access outside config:"
    echo "$ENV_VIOLATIONS"
    echo "FIX: Import config values from src/config/ instead."
    ERRORS=$((ERRORS + 1))
fi

# No cross-domain imports
for domain in users billing notifications; do
  CROSS=$(grep -rn "from.*src/features/" "src/features/$domain/" \
    | grep -v "src/features/$domain/" \
    | grep -v "src/shared/" || true)
  if [ -n "$CROSS" ]; then
    echo "ERROR: Cross-domain import in $domain/:"
    echo "$CROSS"
    echo "FIX: Use shared/interfaces/ for cross-domain access."
    ERRORS=$((ERRORS + 1))
  fi
done

exit $ERRORS
```
