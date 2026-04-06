# Testing Guide

**CRITICAL:** When implementing features, you MUST test them before creating verification document.

## Backend Testing

**Run seeders:**
```bash
cd backend && npm run db:seed
```

**Test API endpoints:**
```bash
# Start server in background
cd backend && npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test endpoint
curl http://localhost:3000/api/health

# Stop server
kill $SERVER_PID
```

**Query database to verify:**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.query('SELECT COUNT(*) FROM books')
  .then(([results]) => console.log('Books:', results[0].count))
  .finally(() => process.exit(0));
"
```

## Frontend Testing

**Start dev server:**
```bash
cd frontend && timeout 5 npm run dev || true
# Note: Use short timeout to verify it starts, don't leave running
```

**Check for errors:**
```bash
cd frontend && npm run build 2>&1 | head -20
```

## Smoke Testing (E2E)

**Purpose:** Verify the app starts and renders without errors in a real browser. Catches dependency mismatches, build failures, and runtime errors that unit tests and lint cannot detect.

**Run smoke test:**
```bash
npm run test:smoke
```

**What it checks:**
- Frontend serves HTTP 200 on localhost:5173
- Backend health endpoint responds on localhost:3000
- App renders in a real browser (Chromium via Playwright)
- No console errors (401 auth errors are expected and excluded)

**When to run:**
- Before starting work on an issue (pre-flight check)
- After implementation, before code review (post-flight check)
- The `/story-runner` and `/batch-runner` commands run smoke tests automatically at both gates

**Smoke test location:** `frontend/smoke/`

**Playwright anti-patterns to avoid:**
- Never use `page.waitForTimeout()` -- it causes flaky tests and unnecessary slowdown. Use event-based waits instead: `waitForSelector`, `waitForLoadState`, or Locator auto-waiting assertions (e.g., `await expect(locator).toBeVisible()`).

**Note:** Smoke tests require both frontend and backend servers to be running. Use `./scripts/start-all.sh` first, or let the smoke test handle startup itself.

## Pyramid E2E Layers

The full Playwright suite under `frontend/e2e/` is organised as a three-layer pyramid.
New tests should pick the **lowest** layer that can express the assertion.

| Layer    | Directory                | What it is for                                                                |
| -------- | ------------------------ | ----------------------------------------------------------------------------- |
| smoke    | `frontend/e2e/smoke/`    | Fast sanity. Public pages render, app loads, no console errors. Mostly unauth. |
| flow     | `frontend/e2e/flow/`     | Multi-step authenticated user journeys (checkout/return, waitlist join/leave). |
| security | `frontend/e2e/security/` | Authorization guards, RBAC, body-spoofing. Asserts non-2xx contracts.          |

**Decision rules — where does my test belong?**

1. Does it need a logged-in user? If **no**, it is a **smoke** test.
2. Does it assert a non-2xx HTTP contract or an authorization boundary? It is a **security** test.
3. Otherwise it is a **flow** test.

**Naming conventions**

- Spec files use kebab-case: `<feature>-<action>.spec.ts` (e.g. `checkout-return.spec.ts`).
- Page objects use PascalCase and live in `frontend/e2e/page-objects/` (e.g. `BooksPage.ts`).

**Fixture-usage rules (mandatory)**

- Authentication MUST go through `loginAs` from `frontend/e2e/fixtures/auth.ts`. Never
  `page.goto('/login')` and fill the form, and never set the dev `X-Patron-Id` header.
- API setup/teardown MUST use `apiRequest` (one-shot reads), `withApiSession` (batched
  authenticated mutations — required to avoid ADR-031 rate-limit storms), or
  `apiRequestRaw` (security tests asserting non-2xx). Never use raw `fetch`.
- Any locator or interaction reused by **two or more specs** MUST be promoted to a
  page object under `frontend/e2e/page-objects/`.

**Run a single layer:**

```bash
npx playwright test --project=smoke
npx playwright test --project=flow
npx playwright test --project=security
```

**Full pyramid:** `./scripts/e2e-test.sh`. **Story-runner gate (smoke only):** `./scripts/smoke-test.sh`.

See `frontend/e2e/README.md` for worked examples of every fixture and a page object.

## Code Quality

**Always run before creating verification:**
```bash
# Backend
cd backend && npm run lint && npm run format

# Frontend
cd frontend && npm run lint && npm run format
```

## Verification Document Format

After implementation, create `.claude/temp/VERIFICATION-<issue#>-REMOVE.md`.
See [EXAMPLE-VERIFICATION-FORMAT.md](../../.claude/commands/EXAMPLE-VERIFICATION-FORMAT.md) for format.

## Escalation Protocol

**Immediate escalation (don't waste time):**
- Issue requirements are unclear or ambiguous
- Multiple valid approaches with unclear trade-offs
- Architectural decisions needed
- Cannot access required resources (database, APIs)

**Three-strikes rule:**
- After 3 failed attempts to fix a bug: Escalate with details
- After 3 failed test runs: Explain what you tried, ask for help

**Blocking dependencies:**
- Database doesn't exist: Document in verification, provide setup steps
- API keys missing: Document requirement, ask human to provide
- External service down: Note in verification, suggest workarounds
