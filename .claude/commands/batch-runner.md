# Batch Runner (with Smoke Test Gates)

**Purpose:** Run 1-5 independent GitHub issues in parallel with smoke test pre-flight and per-worktree post-flight gates.

**Usage:** `/batch-runner <issue-1> [issue-2] [issue-3] [issue-4] [issue-5]`

**Example:** `/batch-runner 5 6 7 8`

---

## Overview

This command wraps `/batch-runner-kit` with Playwright smoke test gates:
1. **Pre-flight:** Verify the app is healthy on main before spawning workers
2. **Post-flight:** After workers complete, test each successful worktree individually

If the pre-flight fails, no workers are spawned. Post-flight results are reported per-issue.

---

## Execution

### Step 1: Parse and Validate Input

Extract issue numbers from `$ARGUMENTS`.

**Validation rules:**
- Must contain 1-5 space-separated integers
- No duplicates
- Each must be a positive integer

**If validation fails:**

```
BATCH RUNNER: Invalid input

Usage: /batch-runner <issue-1> <issue-2> [issue-3] [issue-4] [issue-5]

Example: /batch-runner 5 6 7 8

Requirements:
- Provide 1-5 issue numbers (space-separated)
- Issues must be independent (different areas of codebase)
- No duplicate issue numbers
```

### Step 2: Verify Git State

```bash
git status --porcelain
```

**If not clean, abort** with options to commit, stash, or discard.

Ensure on main branch:

```bash
git branch --show-current
```

### Step 3: Pre-Flight Smoke Test

**3a. Check if servers are running:**

```bash
lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "Frontend running" || echo "Frontend NOT running"
lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "Backend running" || echo "Backend NOT running"
```

**3b. If servers are NOT running, start them:**

```bash
./scripts/start-all.sh
```

**3c. Run smoke test on main branch:**

```bash
npm run test:smoke
```

**If smoke test FAILS:**

```
BATCH RUNNER ABORTED: Pre-flight smoke test failed on main branch.

Main branch is broken. Fix before running batch.

Error details:
<paste smoke test output>

Suggested actions:
1. Check server logs: logs/backend.log and logs/frontend.log
2. Fix the issue on main branch
3. Re-run: /batch-runner <issue-numbers>
```

**If smoke test PASSES:** Continue to Step 4.

### Step 4: Execute Batch Runner Kit

Run the existing batch-runner-kit workflow:

Invoke `/batch-runner-kit <issue-numbers>`

This spawns parallel workers in worktrees. Wait for all workers to complete.

Capture the results: which issues succeeded (with PR URLs) and which failed.

### Step 5: Post-Flight Smoke Tests (Per Worktree)

**CRITICAL: Only one worktree's servers can run at a time (port conflict).**

**5a. Stop servers from main:**

```bash
./scripts/stop-all.sh
```

**5b. For each SUCCESSFUL worktree (skip failed issues):**

1. Navigate to the worktree directory:
   ```bash
   # Worktree paths follow the pattern used by batch-runner-kit
   cd <worktree-path>
   ```

2. Start servers from the worktree:
   ```bash
   ./scripts/start-all.sh
   ```
   Wait for servers to be ready.

3. Run smoke test:
   ```bash
   npm run test:smoke
   ```

4. Record result (PASS or FAIL) for this issue.

5. Stop servers before testing next worktree:
   ```bash
   ./scripts/stop-all.sh
   ```

**5c. After all worktrees tested, restart main servers (optional):**

```bash
cd <project-root>
./scripts/start-all.sh
```

### Step 6: Display Consolidated Results

```
===============================================
BATCH RUNNER COMPLETE
===============================================

Results: <succeeded>/<total> issues completed

Pre-flight smoke test: PASS

-----------------------------------------------

Issue #5: <title>
  Status:      SUCCESS
  PR:          <PR URL>
  Smoke test:  PASS
  Report:      .claude/temp/BATCH-REPORT-5-REMOVE.md

Issue #6: <title>
  Status:      SUCCESS
  PR:          <PR URL>
  Smoke test:  FAIL — app broken after implementation
  Report:      .claude/temp/BATCH-REPORT-6-REMOVE.md

Issue #7: <title>
  Status:      FAILED (implementation)
  Smoke test:  SKIPPED (implementation failed)
  Report:      .claude/temp/BATCH-REPORT-7-REMOVE.md

-----------------------------------------------

Smoke test summary:
  Pre-flight (main): PASS
  Issue #5:          PASS
  Issue #6:          FAIL — review PR for breaking changes
  Issue #7:          SKIPPED

Next steps:
1. Review PRs (smoke test passing):
   - <PR URL for #5>
2. Investigate PRs (smoke test failing):
   - <PR URL for #6> — app broken, check console errors
3. Read failure reports:
   cat .claude/temp/BATCH-REPORT-7-REMOVE.md
4. Perform manual testing per PR descriptions
5. Approve and merge healthy PRs

Worktree cleanup (run after PRs merged):
  git worktree list
  git worktree remove <path-1>
  git worktree remove <path-2>

Temp file cleanup:
  rm .claude/temp/*-5-REMOVE.*
  rm .claude/temp/*-6-REMOVE.*
  rm .claude/temp/*-7-REMOVE.*

===============================================
```

---

## Error Handling

### Validation Failures (Steps 1-3)
Abort the entire batch BEFORE spawning any workers.

### Worker Failures (Step 4)
Workers are fully independent. One failure does not affect others. Failed workers skip post-flight smoke test.

### Port Conflicts (Step 5)
If stop-all.sh does not fully clear ports:
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
```

### All Workers Fail
Show all failure details, report paths, and recovery options.

---

## Notes

- Pre-flight tests main branch health before any work begins
- Post-flight tests each worktree individually (sequential, not parallel)
- Port conflicts are managed by stopping servers between worktree tests
- Smoke test failures in post-flight do NOT revert work — PRs exist for review
- Issues MUST be independent — if issues touch the same files, use `/story-runner` sequentially

---

## Related Commands

- `/batch-runner-kit <n1> <n2> ...` - Inner workflow (no smoke test gates)
- `/story-runner <n>` - Single issue with smoke test gates
- `/code-review-pr <n>` - Review a PR against standards
