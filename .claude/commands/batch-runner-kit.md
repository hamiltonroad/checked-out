# Batch Runner

**Purpose:** Run 1-5 independent GitHub issues in parallel, each in its own worktree, producing PRs with code review for each.

**Usage:** `/batch-runner-kit <issue-1> [issue-2] [issue-3] [issue-4] [issue-5]`

**Example:** `/batch-runner-kit 5 6 7 8`

---

## Overview

Spawns parallel workers (each in an isolated git worktree) to run the full issue lifecycle:

1. Prep (fetch issue, create branch)
2. Plan (deep analysis)
3. Implement (code, test, code review, commit)
4. Merge latest main
5. Push and create PR
6. Write per-issue report

User kicks it off, walks away, comes back to PRs ready for approval.

**Requirements:**

- Issues MUST be independent (different files/components, different areas of codebase)
- If issues touch the same files, use `/story-runner-kit` sequentially instead
- Git must be clean (no uncommitted changes)
- 1-5 issue numbers required

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

Usage: /batch-runner-kit <issue-1> <issue-2> [issue-3] [issue-4] [issue-5]

Example: /batch-runner-kit 5 6 7 8

Requirements:
- Provide 1-5 issue numbers (space-separated)
- Issues must be independent (different areas of codebase)
- No duplicate issue numbers
```

### Step 2: Verify All Issues Exist

For each issue number:

```bash
gh issue view <N> --json number,title,state --jq '.number, .title, .state'
```

**If any issue not found, abort all.**
**If all found, display list and continue.**

### Step 3: Verify Git State

```bash
git status --porcelain
```

**If not clean, abort** with options to commit, stash, or discard.

### Step 4: Update Main Branch

```bash
git fetch origin main
git checkout main
git pull origin main
```

### Step 5: Display Launch Summary

```
BATCH RUNNER: Launching <count> parallel workers

  Worker 1: Issue #5 - "<title>"
  Worker 2: Issue #6 - "<title>"
  Worker 3: Issue #7 - "<title>"

Each worker runs: prep > plan > implement (with code review) > merge main > push > PR

This will take approximately 15-30 minutes. Workers run in parallel.
Waiting for all workers to complete...
```

### Step 6: Spawn Parallel Workers

**CRITICAL: Spawn ALL workers in a SINGLE message with multiple Agent tool calls.**

All Agent calls must be in the SAME message for true parallelism. Do NOT spawn them one at a time.

For each issue number N:

```
Agent tool invocation:
- subagent_type: general-purpose
- isolation: worktree
- description: "Batch worker: issue #<N>"
- prompt: |
    You are batch-worker-agent for GitHub issue #<N>.

    Issue title: "<title from Step 2>"

    Your issue number is: <N>

    You are running in an isolated git worktree. Your working directory
    is a separate copy of the repository. Other workers are running
    simultaneously on different issues in their own worktrees.

    CRITICAL: Your instructions are in `.claude/agents/batch-worker-kit.md`.
    Read that file FIRST and follow it exactly — all 6 phases, in order.
    Do NOT improvise or skip phases. The agent definition is the
    authoritative source for your behavior.

    Return EXACTLY one of:

    SUCCESS: Issue #<N> complete
    PR: <url>
    Branch: <name>
    Commits: <hashes>

    Code review:
    - Critical: <count> (all fixed)
    - High: <count> (all fixed)
    - Medium: <count> (<fixed>/<total>)
    - Low: <count> (deferred)

    Recommendation: <Pass / Pass with fixes>
    Main merge: <status>
    Tests: <status>

    Report: .claude/temp/BATCH-REPORT-<N>-REMOVE.md

    OR:

    ABORT: Issue #<N> failed
    Phase: <phase name>
    Reason: <what went wrong>
    Last successful phase: <phase or "none">

    Report: .claude/temp/BATCH-REPORT-<N>-REMOVE.md
```

**All 1-5 Agent calls in ONE message.** Wait for all to return.

### Step 7: Collect and Parse Results

For each worker response, extract:

- SUCCESS or ABORT status
- PR URL (if success)
- Code review summary (if success)
- Phase and reason (if failure)
- Report file path

### Step 8: Display Consolidated Summary

```
===============================================
BATCH RUNNER COMPLETE
===============================================

Results: <succeeded>/<total> issues completed

-----------------------------------------------

Issue #5: <title>
  Status:  SUCCESS
  PR:      <PR URL>
  Review:  0 Critical, 0 High, 2 Medium, 1 Low
  Merge:   Clean
  Report:  .claude/temp/BATCH-REPORT-5-REMOVE.md

Issue #6: <title>
  Status:  SUCCESS
  PR:      <PR URL>
  Review:  0 Critical, 1 High (fixed), 0 Medium, 3 Low
  Merge:   Clean
  Report:  .claude/temp/BATCH-REPORT-6-REMOVE.md

Issue #7: <title>
  Status:  FAILED
  Phase:   implement
  Reason:  Tests failed after 3 attempts
  Report:  .claude/temp/BATCH-REPORT-7-REMOVE.md

-----------------------------------------------

Next steps:
1. Review PRs:
   - <PR URL 1>
   - <PR URL 2>
2. Read failure report for #7:
   cat .claude/temp/BATCH-REPORT-7-REMOVE.md
3. Perform manual testing per PR descriptions
4. Approve and merge PRs when satisfied

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

### Validation Failures (Steps 1-4)

Abort the entire batch BEFORE spawning any workers.

### Worker Failures (Steps 6-7)

Workers are fully independent. One worker's failure does NOT affect others.

### All Workers Fail

Show all failure details, report paths, and recovery options (run individually with `/story-runner-kit`).

---

## Notes

- Each worker runs in an isolated git worktree (no interference)
- Workers run truly in parallel (1-5 simultaneous)
- Issues MUST be independent — if issues touch the same files, use `/story-runner-kit` sequentially
- PRs are created but NOT merged — user approves and merges manually
- Worktrees persist after batch completes; clean up after merging PRs

---

## Related Commands

- `/story-runner-kit <N>` - Run single issue (sequential, 3 phases)
- `/code-review-pr-kit <N>` - Review a PR against standards
- `/start-worktree-kit <N>` - Create worktree for manual work
