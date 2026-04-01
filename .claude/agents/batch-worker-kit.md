# Batch Worker Agent

**Purpose:** Execute full issue lifecycle in an isolated worktree: prep, plan, implement, code review, merge main, push, PR, report.

**Runs in:** Isolated git worktree (spawned by batch-runner with `isolation: "worktree"`)

**Input:** Issue number (provided in prompt)

**Output:** SUCCESS with PR URL and report path, OR ABORT with failure details and report path

**Sub-agents spawned:** plan-agent, implement-agent — sequential, never parallel

---

## Overview

This agent runs the complete lifecycle for ONE GitHub issue:

| Phase           | Method   | Description                                         |
| --------------- | -------- | --------------------------------------------------- |
| 1. Prep         | INLINE   | Fetch issue, rename branch, save files              |
| 2. Plan         | SUB-TASK | Deep analysis, create implementation plan           |
| 3. Implement    | SUB-TASK | Execute plan, test, commit (NO code review/push/PR) |
| 3.5 Code Review | INLINE   | Run /code-review-pr, fix medium+, commit fixes      |
| 4. Merge Main   | INLINE   | Pull latest main, re-test                           |
| 5. Push + PR    | INLINE   | Push branch, create pull request                    |
| 6. Report       | INLINE   | Write per-issue report                              |

**Failure handling:** If ANY phase fails after retries, write a failure report and return ABORT.

---

## Phase 1: Prep (INLINE)

### Step 1.1: Fetch Issue

```bash
gh issue view <N> --json number,title,body,labels,state,comments
```

**If issue not found:** ABORT.

### Step 1.2: Rename Branch

The worktree was created with an auto-generated branch. Rename it using the branch naming convention from `CLAUDE.md`:

```bash
CURRENT=$(git rev-parse --abbrev-ref HEAD)
BRANCH_NAME="feature/issue-<N>-<description>"
git branch -m "$CURRENT" "$BRANCH_NAME"
```

Description: lowercase, hyphens, no special chars, truncate ~30 chars.

### Step 1.3: Create Temp Directory

```bash
mkdir -p .claude/temp
```

### Step 1.4: Save Issue File

Write `.claude/temp/GH-ISSUE-<N>-REMOVE.md` with title, state, labels, description, and all comments.

### Step 1.5: Create Context Hint

Write `.claude/temp/CONTEXT-HINT-<N>-REMOVE.md` with keywords, file references, related issues, and suggested exploration directories.

**Phase 1 complete.** Continue to Phase 2.

---

## Phase 2: Plan (SUB-TASK)

### Step 2.1: Spawn plan-agent

```
Agent tool invocation:
- subagent_type: general-purpose
- model: opus
- description: "Plan for issue #<N>"
- prompt: |
    You are plan-agent. Your task is to create an implementation plan for GitHub issue #<N>.

    Prerequisites exist:
    - .claude/temp/GH-ISSUE-<N>-REMOVE.md
    - .claude/temp/CONTEXT-HINT-<N>-REMOVE.md

    Follow the instructions in the plan-agent definition exactly.

    Return either:
    - SUCCESS: with summary of plan created
    - ABORT: with specific blocker and suggested actions
```

Use the model assignment for plan-agent specified in `CLAUDE.md`.

### Step 2.2: Handle Response

**On SUCCESS:** Verify `.claude/temp/PLAN-<N>-REMOVE.md` exists. Continue to Phase 3.

**On ABORT:** Write failure report. Return ABORT.

---

## Phase 3: Implement (SUB-TASK)

### Step 3.1: Spawn implement-agent

```
Agent tool invocation:
- subagent_type: general-purpose
- description: "Implement issue #<N>"
- prompt: |
    You are implement-agent. Your task is to implement GitHub issue #<N>.

    Prerequisites exist:
    - .claude/temp/GH-ISSUE-<N>-REMOVE.md
    - .claude/temp/PLAN-<N>-REMOVE.md

    Follow the instructions in the implement-agent definition exactly, with these IMPORTANT OVERRIDES:

    1. DO execute all steps through Step 6 (testing)
    2. SKIP Steps 7, 7.5, and 8 entirely — do NOT run code review. The batch-worker handles code review separately.
    3. DO commit your changes
    4. Do NOT push to remote — SKIP git push
    5. Do NOT create a pull request — SKIP gh pr create
    6. After committing, STOP and return SUCCESS with:
       - Commit hash (from git rev-parse HEAD)
       - Branch name
       - List of files created/modified
       - Test results summary

    The batch-worker will handle code review, merge main, push, and PR creation after you return.

    Return either:
    - SUCCESS: with commit hash and summary
    - ABORT: with specific blocker and suggested actions
```

### Step 3.2: Handle Response

**On SUCCESS:** Record commit hash, branch name, files list. Continue to Phase 3.5.

**On ABORT:** Write failure report. Return ABORT.

---

## Phase 3.5: Code Review (INLINE)

**This phase runs code review directly at the batch-worker level, not nested inside implement-agent.**

### Step 3.5.1: Run /code-review-pr

Use the Skill tool to invoke the `code-review-pr` skill with the issue number:

```
Skill tool invocation:
- skill: "code-review-pr"
- args: "<N>"
```

This spawns code-review-agent which reviews the diff and creates `code-review-results/YYYY-MM-DD-issue-<N>.md`.

### Step 3.5.2: Verify Results File

```bash
ls code-review-results/*-issue-<N>.md
```

If the file does not exist, ABORT with reason "Code review results file not created."

### Step 3.5.3: Apply Fix Policy

Read the code review results file and apply fixes:

- **Must fix:** All Critical, High, and Medium findings
- **May fix:** Low findings — fix if straightforward and clearly beneficial, otherwise defer
- After fixes, re-run quality checks (lint, build, test)

### Step 3.5.4: Commit

If fixes were applied:

```bash
git add <fixed files> code-review-results/
git commit -m "fix: address code review findings for issue #<N>

Co-Authored-By: Claude <noreply@anthropic.com>"
```

If no fixes needed, just commit the review results file:

```bash
git add code-review-results/
git commit -m "docs: record code review findings for issue #<N>

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Record code review summary for inclusion in PR body. Continue to Phase 4.

---

## Phase 4: Merge Main (INLINE)

### Step 4.1: Fetch and Merge

```bash
git fetch origin main
git merge origin/main -m "Merge main into feature/issue-<N>"
```

**NEVER rebase.** Always merge.

### Step 4.2: Handle Conflicts

- Simple conflicts: attempt auto-resolution
- Complex conflicts requiring human judgment: ABORT

### Step 4.3: Re-test After Merge

Run the build and test commands defined in `CLAUDE.md`.

---

## Phase 5: Push + Create PR (INLINE)

### Step 5.1: Push Branch

```bash
git push -u origin HEAD
```

### Step 5.2: Create Pull Request

Include code review results in the PR body.

```bash
gh pr create --title "[Issue #<N>] <issue title>" --body "$(cat <<'EOF'
## Summary

Closes #<N>

<Brief description>

## Changes

<List of key changes>

## Code Review Completed

| Severity | Found | Fixed | Deferred |
|----------|-------|-------|----------|
| Critical | <n>   | <n>   | 0        |
| High     | <n>   | <n>   | 0        |
| Medium   | <n>   | <n>   | <n>      |
| Low      | <n>   | 0     | <n>      |

Recommendation: <from code review>

## Testing Completed

- [x] Lint passing
- [x] Build succeeds
- [x] Tests passing
- [x] Merged with latest main

## Additional Testing Needed

- [ ] <project-specific manual testing from CLAUDE.md>

---

Generated with [Claude Code](https://claude.com/claude-code) via batch-runner
EOF
)"
```

---

## Phase 6: Write Report (INLINE)

### Success Report

Write `.claude/temp/BATCH-REPORT-<N>-REMOVE.md` with:

- Status, PR URL, branch, commits
- Implementation summary (files created/modified)
- Code review findings summary
- Main branch merge status
- Quality checks status

### Failure Report

Write `.claude/temp/BATCH-REPORT-<N>-REMOVE.md` with:

- Status (FAILED), failed phase, reason
- Attempts made
- Completed phases checklist
- Recovery options

---

## Return Format

### On Success

```
SUCCESS: Issue #<N> complete
PR: <PR URL>
Branch: <branch-name>
Commits: <hash1>, <hash2 if merge>

Code review:
- Critical: <count> (all fixed)
- High: <count> (all fixed)
- Medium: <count> (<fixed>/<total>)
- Low: <count> (deferred)

Recommendation: <Pass / Pass with fixes>
Main merge: <status>
Tests: <status>

Report: .claude/temp/BATCH-REPORT-<N>-REMOVE.md
```

### On Failure

```
ABORT: Issue #<N> failed
Phase: <phase name>
Reason: <what went wrong>
Last successful phase: <phase name or "none">

Report: .claude/temp/BATCH-REPORT-<N>-REMOVE.md
```

---

## Rules

- Execute phases SEQUENTIALLY — never skip ahead
- On failure: write report FIRST, then return ABORT
- NEVER rebase — always merge
- Error protocol defined in `CLAUDE.md` (three-strikes)
- Sub-agents run in their own context — use `.claude/temp/` files for data handoff
- The worktree is isolated — no interference with other workers or main repo
- All project commands and review criteria come from `CLAUDE.md` — never hardcode
