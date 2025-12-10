# Claude Developer Guide

**Essential information for Claude AI sessions working on this project**

---

## Quick Start for New Sessions

### 1. Project Overview
- **Name:** Checked Out - Library Management System
- **Architecture:** 3-tier (React frontend + Express backend + MySQL database)
- **Purpose:** Teaching full-stack development with modern technologies

### 2. Key Standards
All standards are in `/standards/quick-ref/`:
- [frontend-quick-ref.md](standards/quick-ref/frontend-quick-ref.md) - React + Material UI patterns
- [backend-quick-ref.md](standards/quick-ref/backend-quick-ref.md) - Node.js + Express + Sequelize patterns
- [craftsmanship-quick-ref.md](standards/quick-ref/craftsmanship-quick-ref.md) - DRY, KISS, SOLID principles

### 3. Workflow

**Agent-based workflow (recommended for context efficiency):**
```bash
/story-runner <number>   # Runs all 3 phases via agents, minimal context usage
```

**Manual workflow (for control or debugging):**
```bash
/prep-issue <number>     # Phase 1: Setup and context (Sonnet)
/plan-issue <number>     # Phase 2: Deep planning (Opus)
/implement-issue <number> # Phase 3: Execution (Sonnet)
```

See [.claude/commands/](.claude/commands/) for complete command documentation.

---

## Agent-Based Workflow

For maximum context efficiency, use the agent-based workflow:

```bash
/story-runner <issue-number>
```

This spawns three agents in sequence, each in an isolated context:

1. **prep-agent** - Fetch issue, create branch, generate context hints
2. **plan-agent** - Deep analysis, create implementation plan (with enterprise patterns)
3. **implement-agent** - Execute plan, test, commit, create PR

**Benefits:**
- Each agent runs in isolated 200k context
- Main context preserved for other work (~2-5k tokens used for orchestration)
- Can run multiple issues in parallel via worktrees
- Same quality as manual workflow, but automated

**When to use manual workflow instead:**
- Agent aborted and you want to resume from a specific phase
- Complex/ambiguous issue where you expect mid-flight decisions
- Debugging agent behavior
- Teaching someone the workflow

**Agent definitions:** `.claude/agents/`
**Enterprise patterns:** `standards/quick-ref/enterprise-patterns-quick-ref.md`

---

## Database Access

**IMPORTANT:** Claude can query the MySQL database using Sequelize via Node.js one-liners.

### How to Query Database

**Recommended method (uses project .env config):**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.query('SELECT COUNT(*) as count FROM books')
  .then(([results]) => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => console.error('Error:', err.message))
  .finally(() => process.exit(0));
"
```

**Why this works:**
- Uses existing `.env` configuration (no password in commands)
- Full access to Sequelize ORM
- Can execute any SQL query
- Returns JSON results

### Common Database Queries

**Check if database exists:**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => process.exit(0));
"
```

**Get table counts:**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.query('SHOW TABLES')
  .then(([tables]) => {
    console.log('Tables:', tables);
    return Promise.all(
      tables.map(t => {
        const tableName = t['Tables_in_checked_out'];
        return db.sequelize.query(\`SELECT COUNT(*) as count FROM \${tableName}\`)
          .then(([result]) => ({ table: tableName, count: result[0].count }));
      })
    );
  })
  .then(counts => console.log(JSON.stringify(counts, null, 2)))
  .finally(() => process.exit(0));
"
```

**Query specific data:**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.query('SELECT * FROM books LIMIT 5')
  .then(([results]) => console.log(JSON.stringify(results, null, 2)))
  .finally(() => process.exit(0));
"
```

### Database Prerequisites

If you get `Error: Unknown database 'checked_out'`:
1. Database hasn't been created yet
2. Document this as a blocker in verification
3. Provide setup instructions for human

**Setup commands (for human):**
```bash
# Create database
mysql -u root -p <<EOF
CREATE DATABASE checked_out CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

# Run migrations
cd backend && npm run db:migrate

# Seed database (optional)
npm run db:seed
```

---

## Testing Implementation

**CRITICAL:** When implementing features, you MUST test them before creating verification document.

### Backend Testing

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

### Frontend Testing

**Start dev server:**
```bash
cd frontend && timeout 5 npm run dev || true
# Note: Use short timeout to verify it starts, don't leave running
```

**Check for errors:**
```bash
cd frontend && npm run build 2>&1 | head -20
```

### Code Quality

**Always run before creating verification:**
```bash
# Backend
cd backend && npm run lint && npm run format

# Frontend
cd frontend && npm run lint && npm run format
```

---

## Verification Document Format

After implementation, create `.claude/temp/VERIFICATION-<issue#>-REMOVE.md` with:

### Required Sections

1. **Implementation Summary**
   - List all files created/modified
   - Briefly describe changes

2. **Claude's Test Results** ← CRITICAL
   - Show actual commands you ran
   - Include real output (copy/paste)
   - Show database queries and results
   - Document any blockers encountered
   - Explain what you tested vs. what was blocked

3. **Additional Testing for Human**
   - Tests you couldn't perform (with reasons why)
   - Step-by-step instructions
   - Expected results

4. **Quality Checks Completed**
   - ESLint/Prettier status
   - No console.log statements
   - Standards compliance verified
   - **Checkbox for "Claude tested implementation"**

See [.claude/commands/EXAMPLE-VERIFICATION-FORMAT.md](.claude/commands/EXAMPLE-VERIFICATION-FORMAT.md) for complete example.

---

## Common Patterns

### Sequelize Model Pattern
```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Model = sequelize.define('ModelName', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    field: { type: DataTypes.STRING(255), allowNull: false },
  }, {
    tableName: 'table_name',
    timestamps: true,
    underscored: true,
  });

  Model.associate = (models) => {
    // Associations here
  };

  return Model;
};
```

### Service Pattern
```javascript
class BookService {
  async getAllBooks(filters = {}) {
    const where = {};
    if (filters.genre) where.genre = filters.genre;
    return Book.findAll({ where });
  }
}
```

### Controller Pattern
```javascript
class BookController {
  async getAllBooks(req, res, next) {
    try {
      const result = await bookService.getAllBooks(req.query);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }
}
```

---

## Escalation Protocol

### When to Ask Human for Help

**Immediate escalation (don't waste time):**
- Issue requirements are unclear or ambiguous
- Multiple valid approaches with unclear trade-offs
- Architectural decisions needed
- Cannot access required resources (database, APIs)

**Three-strikes rule:**
- After 3 failed attempts to fix a bug: Escalate with details
- After 3 failed test runs: Explain what you tried, ask for help

**Blocking dependencies:**
- Database doesn't exist → Document in verification, provide setup steps
- API keys missing → Document requirement, ask human to provide
- External service down → Note in verification, suggest workarounds

---

## File Locations

**Important files:**
- Project standards: `/standards/quick-ref/`
- Backend code: `/backend/src/`
- Frontend code: `/frontend/src/`
- Database scripts: `/database/scripts/`
- Slash commands: `/.claude/commands/`

**Configuration:**
- Backend env: `/backend/.env` (database credentials)
- Frontend env: `/frontend/.env` (API URL)
- Database config: `/backend/src/config/database.js`

**Testing outputs:**
- Session files: `/.claude/temp/` (temporary, remove after session)
- Verification docs: `/.claude/temp/VERIFICATION-<number>-REMOVE.md`

---

## Quality Standards

### Must-haves before marking complete:
- [ ] ESLint passing (no new warnings/errors)
- [ ] Prettier formatted
- [ ] No console.log statements in production code
- [ ] PropTypes defined (React components)
- [ ] Tests written (if applicable)
- [ ] **Implementation actually tested by Claude**
- [ ] Verification document with real results
- [ ] Human validated functionality

### Code reviews check for:
- DRY: No repeated code
- KISS: Simple, clear solutions
- SOLID: Single responsibility, proper abstractions
- Error handling: All edge cases covered
- Security: No exposed credentials, SQL injection protected

---

## Quick Reference

**Start server:**
```bash
# Both services
./scripts/start-all.sh

# Backend only
./scripts/start-backend.sh

# Frontend only
./scripts/start-frontend.sh
```

**Stop services:**
```bash
./scripts/stop-all.sh
```

**Database operations:**
```bash
cd backend
npm run db:migrate      # Run migrations
npm run db:seed         # Seed data
npm run db:seed:undo    # Undo last seed
```

**Code quality:**
```bash
npm run lint    # Check code style
npm run format  # Auto-format code
npm test        # Run tests
```

---

## Session Notes

**For your current session:**
- Review existing verification docs in `.claude/temp/` to understand recent work
- Check git status to see uncommitted changes
- Read issue in `.claude/temp/GH-ISSUE-<number>-REMOVE.md` if continuing work
- Use TodoWrite to track progress through complex tasks

**Before ending session:**
- Complete verification document with your test results
- Mark final todo as "waiting for human validation"
- Don't commit or create PR (human does that after validating)

---

**Last updated:** 2025-11-03
**For questions:** See project README.md or standards documentation
