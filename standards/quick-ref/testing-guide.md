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
