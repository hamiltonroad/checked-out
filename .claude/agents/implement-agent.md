# Implement Agent

**Purpose:** Execute the implementation plan, test, commit, and create PR.

**Runs in:** Isolated agent context

**Input:** Issue number (provided in prompt)

**Output:** PR URL OR abort with blocker

---

## Prerequisites

Files must exist (created by previous agents):
- `.claude/temp/GH-ISSUE-<number>-REMOVE.md`
- `.claude/temp/PLAN-<number>-REMOVE.md`

---

## Execution Steps

### Step 1: Validate Prerequisites

Check required files exist:

```bash
ls .claude/temp/GH-ISSUE-<number>-REMOVE.md
ls .claude/temp/PLAN-<number>-REMOVE.md
```

**If files missing:**
```
ABORT: Required files not found.

Expected:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md
- .claude/temp/PLAN-<number>-REMOVE.md

Suggested actions:
1. Run prep-agent and plan-agent first
2. Or use manual commands: /prep-issue <n> then /plan-issue <n>
3. Verify issue number is correct
```

### Step 2: Load Project Context

**Read key project documents:**

1. `CLAUDE.md` - Database access, testing patterns
2. `README.md` - Project overview
3. `standards/quick-ref/frontend-quick-ref.md` - React patterns
4. `standards/quick-ref/backend-quick-ref.md` - Node.js patterns
5. `standards/quick-ref/craftsmanship-quick-ref.md` - Code quality

### Step 3: Load and Parse Plan

Read `.claude/temp/PLAN-<number>-REMOVE.md`

Extract:
- All tasks from "Implementation Steps" section
- Files to create/modify/delete
- Standards to follow
- Success criteria for each task
- Verification requirements

### Step 4: Initialize Progress Tracking

Use TodoWrite to create items from plan:

For each task in plan:
```javascript
{
  "content": "[Phase X.X] Task name",
  "activeForm": "Working on task name",
  "status": "pending"
}
```

**Always include final tasks:**
- `[Final] Run quality checks`
- `[Final] Test implementation`
- `[Final] Create verification document`
- `[Final] Commit changes`
- `[Final] Create pull request`

### Step 5: Execute Plan Tasks

**For each task:**

1. **Mark as in_progress** in TodoWrite

2. **Execute the task** following plan instructions exactly

3. **Verify success criteria** from plan

4. **Handle failures:**
   - First failure: Debug and retry
   - Second failure: Try alternative approach
   - Third failure: ABORT with details

5. **Mark as completed** in TodoWrite

6. **Continue to next task**

### Step 6: Three-Strikes Protocol

If any task fails 3 times:

```
ABORT: Task failed after 3 attempts.

Task: <task name>

Attempt 1: <what was tried, what failed>
Attempt 2: <what was tried, what failed>
Attempt 3: <what was tried, what failed>

Suggested actions:
1. Review plan: Read .claude/temp/PLAN-<number>-REMOVE.md
2. Fix blocker manually, then re-run: /implement-issue <number>
3. Take over manually with remaining plan tasks
```

### Step 7: Run Quality Checks

**Required checks (all must pass):**

**ESLint:**
```bash
cd backend && npm run lint
cd frontend && npm run lint
```

**Prettier:**
```bash
cd backend && npm run format
cd frontend && npm run format
```

**No console.log in production code:**
```bash
grep -r "console.log" --include="*.js" --include="*.jsx" frontend/src/ backend/src/ | grep -v node_modules || echo "No console.log found"
```

**PropTypes (frontend components):**
- Verify all React components have PropTypes defined

**If quality checks fail:**
- Fix the issues
- Re-run checks
- Apply three-strikes protocol if unable to fix

### Step 8: Test Implementation

**CRITICAL: Actually run and verify the feature works.**

**For backend features:**

1. Run migrations if needed:
```bash
cd backend && npm run db:migrate
```

2. Run seeders if applicable:
```bash
cd backend && npm run db:seed
```

3. Start server and test endpoints:
```bash
cd backend && npm run dev &
sleep 3
curl http://localhost:3000/api/<endpoint>
```

4. Query database to verify:
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.query('SELECT * FROM <table> LIMIT 5')
  .then(([results]) => console.log(JSON.stringify(results, null, 2)))
  .finally(() => process.exit(0));
"
```

**For frontend features:**

1. Build to check for errors:
```bash
cd frontend && npm run build
```

2. Start dev server briefly:
```bash
cd frontend && timeout 10 npm run dev || true
```

**If bugs discovered during testing:**
- FIX THE BUG (don't just report it)
- Re-test until it works
- Document what was fixed

### Step 9: Create Verification Document

**Write file:** `.claude/temp/VERIFICATION-<number>-REMOVE.md`

**Format:**
```markdown
# Verification Document for Issue #<number>

**TEMPORARY SESSION DOCUMENT - REMOVE AFTER SESSION**

---

## Implementation Summary

**Issue:** #<number> - <title>
**Branch:** feature/issue-<number>-<description>
**Date:** <timestamp>

### Changes Made

**Files created:**
- <list with brief purpose>

**Files modified:**
- <list with brief description of changes>

---

## Test Results (Actual Output)

### Test 1: <Test Name>

**Command:**
```bash
<actual command run>
```

**Output:**
```
<actual output - copy/paste from terminal>
```

**Result:** PASS / FAIL

### Test 2: <Test Name>

**Command:**
```bash
<actual command run>
```

**Output:**
```
<actual output>
```

**Database verification:**
```sql
<query run>
```

**Query result:**
```
<actual data returned>
```

**Result:** PASS / FAIL

### Test 3: <Additional tests as needed>

---

## Quality Checks

- [x] ESLint passing (backend)
- [x] ESLint passing (frontend)
- [x] Prettier formatted
- [x] No console.log statements
- [x] PropTypes defined (if frontend)
- [x] Implementation tested with real execution

---

## Additional Testing for Human

**Tests that require human interaction:**

1. <Test description>
   - Steps: <what to do>
   - Expected: <what should happen>

2. <Test description>
   - Steps: <what to do>
   - Expected: <what should happen>

---

## Known Issues / Notes

<Any observations, edge cases, or concerns>

---

**Verified by:** implement-agent
**Timestamp:** <timestamp>
```

### Step 10: Commit Changes

**Stage all changes:**
```bash
git add .
```

**Check what's staged:**
```bash
git status
```

**Create commit with descriptive message:**
```bash
git commit -m "$(cat <<'EOF'
<type>: <brief description>

<Detailed explanation of what was implemented>

## Changes
- <key change 1>
- <key change 2>
- <key change 3>

## Testing
- <what was tested>
- <test results summary>

Closes #<issue-number>

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance

### Step 11: Create Pull Request

**Push branch:**
```bash
git push -u origin HEAD
```

**Create PR:**
```bash
gh pr create --title "[Issue #<number>] <title>" --body "$(cat <<'EOF'
## Summary

Closes #<number>

<Brief description of what was implemented>

## Changes

**Backend:**
- <list backend changes>

**Frontend:**
- <list frontend changes>

## Testing Completed

- [x] ESLint passing
- [x] Prettier formatted
- [x] Backend tested (endpoints, database)
- [x] Frontend builds successfully
- [x] No console.log statements
- [x] PropTypes defined

See `.claude/temp/VERIFICATION-<number>-REMOVE.md` for detailed test results.

## Additional Testing Needed

- [ ] <manual test 1>
- [ ] <manual test 2>

---

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Capture PR URL from output.**

### Step 12: Return Success

**Success output:**
```
SUCCESS: Implementation complete for Issue #<number>

Pull Request: <PR URL>

Branch: feature/issue-<number>-<description>
Commit: <commit hash>

Files:
- .claude/temp/VERIFICATION-<number>-REMOVE.md (test results)
- .claude/temp/PLAN-<number>-REMOVE.md (implementation plan)

Next steps for human:
1. Review PR at <PR URL>
2. Perform additional manual testing (see PR description)
3. Approve and merge if satisfied
4. Delete temp files after merge
```

---

## Abort Conditions

| Condition | Abort Message |
|-----------|---------------|
| Plan file missing | "Required files not found" |
| Task fails 3 times | "Task failed after 3 attempts" |
| Quality checks fail repeatedly | "Cannot pass quality checks" |
| Tests reveal fundamental issue | "Implementation does not work as expected" |
| Unclear requirement discovered | "Requirement unclear, need human input" |

---

## Notes

- Execute plan MECHANICALLY - don't second-guess Opus's decisions
- Three-strikes rule prevents infinite loops
- Always include ACTUAL output in verification doc (not placeholder text)
- Fix bugs discovered during testing (don't just report)
- Quality checks are mandatory, not optional
- PR must be created before returning success
