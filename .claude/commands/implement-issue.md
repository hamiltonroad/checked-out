# Implement Issue (Phase 3: Execution)

**Purpose:** Execute Opus plan with Sonnet - implement changes, track progress, validate with human.

**Model:** Sonnet (fast execution)

**Usage:** `/implement-issue <issue-number>`

**Prerequisites:** Must run `/prep-issue <number>` and `/plan-issue <number>` first

**Quality Gates:**
- ESLint and Prettier MUST pass
- PropTypes MUST be defined (frontend)
- Standards compliance MUST be verified
- Three-strikes rule: 3 fix attempts, then escalate to human

**End Result:** Implementation complete, code committed, PR created, ready for review

---

## WHAT THIS COMMAND DOES

1. ✅ Read plan from `.claude/temp/PLAN-<number>-REMOVE.md`
2. ✅ Use TodoWrite to track progress through all tasks
3. ✅ Execute plan step-by-step (mechanically follow Opus plan)
4. ✅ Apply three-strikes escalation protocol if blocked
5. ✅ Run quality checks (ESLint, Prettier)
6. ✅ Test implementation (backend endpoints, frontend builds)
7. ✅ Create verification document with test results
8. ✅ Commit changes with descriptive commit message
9. ✅ Create pull request with summary and test plan
10. ✅ Display PR URL for human review

**This command does NOT:**
- ❌ Skip quality checks (ESLint, Prettier required)
- ❌ Commit code that doesn't pass tests
- ❌ Merge the PR (human reviews and merges)

---

## EXECUTION STEPS

### Step 1: Validate Prerequisites

**Check required file exists:**
```bash
ls .claude/temp/PLAN-<number>-REMOVE.md
```

**If plan missing:**
```
❌ Error: Implementation plan not found.

Expected file: .claude/temp/PLAN-<number>-REMOVE.md

Please run these commands in order:
1. /prep-issue <number>    # Setup
2. /plan-issue <number>    # Planning (Opus)
3. /implement-issue <number>  # Execution (this command)
```

**If plan exists:**
- ✅ Continue to Step 2

### Step 2: Load Project Context

**Read these key project documents:**

1. `/Users/jmcrider/vscode/checked out/.claude/CLAUDE.md` - Essential guide (database access, testing patterns)
2. `/Users/jmcrider/vscode/checked out/README.md` - Project overview
3. `/Users/jmcrider/vscode/checked out/standards/quick-ref/frontend-quick-ref.md` - React patterns
4. `/Users/jmcrider/vscode/checked out/standards/quick-ref/backend-quick-ref.md` - Node.js patterns
5. `/Users/jmcrider/vscode/checked out/standards/quick-ref/craftsmanship-quick-ref.md` - Code quality

**Why load context:**
- Ensures implementation follows standards
- Provides patterns and conventions
- Informs decision-making when plan is unclear

### Step 3: Load and Parse Plan

**Read plan file:**
```bash
cat .claude/temp/PLAN-<number>-REMOVE.md
```

**Extract key information:**
- All tasks from "Implementation Steps" section
- Standards to follow
- Human decision points
- Verification requirements

### Step 4: Initialize TodoWrite Progress Tracking

**Create TodoWrite items from plan:**

For each task in plan, create todo:
```javascript
{
  "content": "[Phase X.X] Task name (Est: 30 min)",
  "activeForm": "Working on task name",
  "status": "pending"
}
```

**Always append final tasks:**
```javascript
{
  "content": "[Final] Run ESLint and Prettier",
  "activeForm": "Running code quality checks",
  "status": "pending"
},
{
  "content": "[Final] Execute and test implementation",
  "activeForm": "Testing implementation",
  "status": "pending"
},
{
  "content": "[Final] Create verification document with results",
  "activeForm": "Creating verification document",
  "status": "pending"
},
{
  "content": "[Final] Commit changes",
  "activeForm": "Committing changes",
  "status": "pending"
},
{
  "content": "[Final] Create pull request",
  "activeForm": "Creating pull request",
  "status": "pending"
}
```

### Step 5: Execute Plan Tasks

**For each task in TodoWrite:**

1. **Mark task as in_progress**
   - Update TodoWrite status to "in_progress"

2. **Execute the task**
   - Follow plan instructions exactly
   - Reference standards as needed
   - Use context-fetcher for exploration

3. **Verify task completion**
   - Check success criteria from plan
   - Verify code quality
   - Test manually if possible

4. **Mark task as completed**
   - Update TodoWrite status to "completed"

5. **Move to next task**

**Escalation protocol:**
- If blocked after 3 attempts: Escalate to human with details
- If requirements unclear: Stop and ask human for clarification
- If technical blocker: Explain attempts and request help
- **If bug discovered during testing: FIX IT, then re-test** (don't mark as blocker)

### Step 6: Run Quality Checks

**Before testing implementation:**

1. **Run ESLint:**
```bash
npm run lint
```

2. **Run Prettier:**
```bash
npm run format
```

3. **Check for console.log:**
```bash
grep -r "console.log" --include="*.js" --include="*.jsx" frontend/src/ backend/src/
```

4. **Verify PropTypes (frontend only):**
- Check all React components have PropTypes defined

### Step 7: Execute and Test Implementation

**CRITICAL: Claude must actually run and test the implementation**

**Testing Philosophy:**
- **DO:** Create databases, run migrations, execute seeders, start servers
- **DO:** Fix bugs discovered during testing (schema issues, data errors, etc.)
- **DO:** Re-test after fixes until implementation works
- **ONLY ESCALATE:** Authorization failures, missing credentials, unclear requirements

**For backend features (seeders, API endpoints, services):**
1. **Set up prerequisites:**
   - Create database if doesn't exist: `mysql -u root -e "CREATE DATABASE IF NOT EXISTS db_name;"`
   - Run SQL scripts if needed: `mysql -u root db_name < script.sql`
   - Run migrations: `npm run db:migrate`

2. **Run the implementation:**
   - Execute seeder: `npm run db:seed`
   - Start server and test endpoint: `curl http://localhost:3000/api/...`
   - Test functionality end-to-end

3. **If errors occur:**
   - **Fix the bug** (schema issues, data problems, logic errors)
   - **Re-test** until it works
   - **Document what was fixed** in verification

4. **Capture actual output:**
   - Save command output
   - Take screenshots if relevant
   - Query database to verify data (use Sequelize or mysql command)

   **Database queries (two options):**
   ```bash
   # Option 1: Using Sequelize (uses .env config, no password needed)
   cd backend && node -e "
   const db = require('./src/models');
   db.sequelize.query('SELECT COUNT(*) as count FROM books')
     .then(([results]) => console.log(results))
     .finally(() => process.exit(0));
   "

   # Option 2: Using mysql command (requires password)
   mysql -u root -p checked_out -e "SELECT COUNT(*) FROM books;"
   ```

3. **Verify results:**
   - Check for errors
   - Verify expected data exists
   - Validate edge cases

**For frontend features:**
1. **Start dev server:**
   - Run `npm run dev`
   - Note port and URL

2. **Verify it loads:**
   - Check console for errors
   - Verify component renders
   - Test basic interactions if possible

3. **Capture evidence:**
   - Screenshots of console
   - Network requests
   - UI state

**What to capture:**
- Full command output (stdout/stderr)
- Database query results
- Error messages (if any)
- Success indicators
- Data samples created/modified

### Step 8: Create Verification Document with Actual Results

**Create file:** `.claude/temp/VERIFICATION-<number>-REMOVE.md`

**Format:**
```markdown
# Verification Document for Issue #<number>

**⚠️ TEMPORARY SESSION DOCUMENT - REMOVE AFTER SESSION**

---

## Implementation Summary

**Issue:** #<number> - <title>
**Branch:** feature/issue-<number>-<description>
**Implementation date:** <date>

### Changes Made

**Frontend changes:**
- <List of frontend files modified/created>

**Backend changes:**
- <List of backend files modified/created>

**Database changes:**
- <List of migrations/model changes>

## Claude's Test Results

**IMPORTANT: This section shows what Claude actually tested**

### Test 1: [Test Name]

**Command executed:**
```bash
<actual command run>
```

**Output:**
```
<actual output from command>
```

**Result:** ✅ Success / ❌ Failed
**Notes:** <any observations>

### Test 2: [Test Name]

**Command executed:**
```bash
<actual command run>
```

**Output:**
```
<actual output>
```

**Database verification:**
```sql
<SQL query run>
```

**Query results:**
```
<actual results from database>
```

**Result:** ✅ Success / ❌ Failed

### Test 3: Idempotency Test (if applicable)

**Command executed:**
```bash
<run same command again>
```

**Output:**
```
<output showing no duplicates created>
```

**Result:** ✅ Success / ❌ Failed

### Summary of Claude's Testing

- [x] Implementation runs without errors
- [x] Expected data created/modified
- [x] Idempotency verified (if applicable)
- [x] Edge cases tested
- [ ] Additional testing needed (see below)

## Additional Testing for Human

**These are additional tests Claude could not perform:**

### Test 1: [Additional Test]
**Why Claude couldn't do this:** <reason - e.g., requires UI interaction, specific environment>

**Steps:**
1. <action>
2. <action>

**Expected result:** <what should happen>

### Test 2: [Additional Test]
**Why Claude couldn't do this:** <reason>

**Steps:**
1. <action>
2. <action>

**Expected result:** <what should happen>

### Quality Checks Completed

- [x] ESLint passing
- [x] Prettier formatting applied
- [x] No console.log statements
- [x] PropTypes defined (frontend)
- [x] Standards compliance verified
- [x] **Claude tested implementation with real execution**

### Known Issues / Limitations

<List any known issues or areas needing human decision>

### Next Steps

1. ✅ Review Claude's test results above
2. ✅ Perform additional adhoc testing
3. ✅ Create PR if satisfied
4. ✅ Merge PR after review
```

### Step 9: Commit Changes

**After all tests pass, commit the code:**

1. **Check git status:**
```bash
git status
```

2. **Add all modified/created files:**
```bash
git add .
```

3. **Create commit with descriptive message:**
```bash
git commit -m "$(cat <<'EOF'
[Issue type]: [Brief description]

[Detailed description of what was implemented]

## Changes
- [List of key changes]

## Testing
- [What was tested]
- [Test results]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Example commit message for Issue #3:**
```
Add book detail modal to display complete book information

Implemented interactive modal that opens when users click book rows in the
book list table. Modal displays all book details including title, authors,
ISBN, publisher, publication year, genre, and availability status.

## Changes
Backend:
- Added GET /api/v1/books/:id endpoint with validation
- Created getBookById service method with author association
- Added 404 error handling for non-existent books

Frontend:
- Created BookDetailModal component with loading/error states
- Added useBook React Query hook for fetching single book
- Integrated modal into BooksPage with click handlers
- Implemented responsive design (fullScreen on mobile)

## Testing
- Backend endpoint tested with curl (200 and 404 cases)
- Frontend builds successfully
- ESLint and Prettier passing
- PropTypes defined
- 61 books in database for testing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

4. **Verify commit created:**
```bash
git log -1 --oneline
```

### Step 10: Create Pull Request

**After commit is successful, create PR using gh CLI:**

1. **Read issue for PR context:**
```bash
cat .claude/temp/GH-ISSUE-<number>-REMOVE.md
```

2. **Push branch to remote:**
```bash
git push -u origin HEAD
```

3. **Create PR with summary from verification document:**
```bash
gh pr create --title "[Issue #<number>] <Issue title>" --body "$(cat <<'EOF'
## Summary
Closes #<number>

[Brief description of what was implemented]

## Changes
**Backend:**
- [List backend changes]

**Frontend:**
- [List frontend changes]

## Testing Completed by Claude
- ✅ Backend endpoint tested (200 and 404 cases)
- ✅ Frontend builds successfully
- ✅ ESLint and Prettier passing
- ✅ PropTypes defined
- ✅ No console.log statements
- ✅ Standards compliance verified

See [verification document](.claude/temp/VERIFICATION-<number>-REMOVE.md) for detailed test results.

## Additional Testing Needed
- [ ] Manual browser testing (click book rows, verify modal opens)
- [ ] Verify all book details display correctly
- [ ] Test close button and click-outside behavior
- [ ] Verify responsive design on mobile
- [ ] Check for console errors

## Verification Document
Detailed test results available at: `.claude/temp/VERIFICATION-<number>-REMOVE.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

4. **Capture PR URL and display to user**

### Step 11: Final Summary

**Display to user:**
```markdown
✅ **Implementation Complete for Issue #<number>**

**Branch:** feature/issue-<number>-<description>
**Commit:** [commit hash]
**Pull Request:** [PR URL]

**✅ All Tasks Completed:**
- ✅ Implementation complete
- ✅ Tests passing (ESLint, Prettier, builds)
- ✅ Backend endpoint tested
- ✅ Verification document created
- ✅ Code committed
- ✅ Pull request created

**Next Steps:**
1. Review PR at [PR URL]
2. Perform additional manual testing (see PR description)
3. Approve and merge if satisfied
4. Delete feature branch after merge

**Files to review:**
- See PR diff for all changes
- Verification document: `.claude/temp/VERIFICATION-<number>-REMOVE.md`
```

---

## ERROR HANDLING

**Plan file missing:**
```
❌ Error: Plan file not found.
Run /plan-issue <number> first.
```

**Task blocked after 3 attempts:**
```
⚠️ Unable to complete task after 3 attempts.

Task: <task name>
Attempts:
1. <what was tried>
2. <what was tried>
3. <what was tried>

ESCALATING TO HUMAN - Need assistance
```

**Unclear requirements:**
```
⚠️ Requirement unclear in plan.

Issue: <description of ambiguity>
Need human clarification before proceeding.
```

---

## NOTES

- This command uses Sonnet for fast execution
- Implementation follows plan mechanically
- Human validation is REQUIRED before completion
- Three-strikes rule prevents infinite loops
- Standards compliance is mandatory

---

**Related Commands:**
- `/prep-issue <number>` - Phase 1: Setup
- `/plan-issue <number>` - Phase 2: Planning (Opus)
- `/implement-issue <number>` - Phase 3: Execution (this command)
