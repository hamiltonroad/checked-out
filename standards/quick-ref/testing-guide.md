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
