# Implement Agent

**Purpose:** Execute the implementation plan, run code review, test, commit, and create PR.

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

Check required files exist. If missing, ABORT.

### Step 2: Load Project Context

Read `CLAUDE.md` for:

- Project commands (lint, build, test, etc.)
- Code review focus areas and severity levels
- Conventions (commit style, co-author line)
- Error protocol (three-strikes)

Also read `README.md` if present.

### Step 3: Load and Parse Plan

Read `.claude/temp/PLAN-<number>-REMOVE.md`

Extract: all tasks, files to create/modify, success criteria.

### Step 4: Execute Plan Tasks

**For each task:**

1. **Before creating any new function, type, or helper:** Search the codebase for existing implementations. Reuse or extend existing code rather than duplicating. This applies especially to test factories and shared utilities.
2. Execute following plan instructions exactly
3. **Boy Scout Rule:** While editing a file, if you encounter preexisting standards violations, architecture rule breaks, or code quality issues — fix them. Only in files you are already modifying. Commit these fixes separately from feature work (see step 4).
4. Verify success criteria (lint, build, typecheck pass)
5. **Commit the completed task** — each task gets its own commit capturing one logical unit of work. Use the commit style and co-author line from `CLAUDE.md`. Preexisting fixes get their own commit: `fix: address preexisting violations in <file>`.
6. Handle failures per the error protocol defined in `CLAUDE.md`

**Commit guidance:** A commit should capture one coherent change. If a task is large, it may warrant multiple commits. If two tasks are trivially small and tightly coupled, they may share a commit. Use judgment — the goal is reviewable, revertable units.

### Step 5: Run Quality Checks

Run the lint, build, and test commands defined in the Commands table in `CLAUDE.md`.

**If any command is TBD in CLAUDE.md, skip it and note it was skipped.**

### Step 6: Test Implementation

**CRITICAL: Actually run and verify the feature works.**

1. Run the build command from `CLAUDE.md`
2. Run the test command from `CLAUDE.md`

**If bugs discovered:** Fix them, re-test, commit fixes separately.

### Step 7: Code Review (via code-review-agent)

Spawn the code-review-agent to review all changes:

```
Agent tool invocation:
- subagent_type: general-purpose
- description: "Code review for issue #<number>"
- prompt: |
    You are code-review-agent. Perform comprehensive code review for Issue #<number>.

    First, read .claude/agents/code-review-kit.md and follow every step exactly.

    MANDATORY OUTPUT: You MUST create the file code-review-results/YYYY-MM-DD-issue-<number>.md
    (using today's date). This is non-negotiable — a missing file means the review never happened.
    Follow the exact format specified in Step 8 of your agent definition. If no findings exist,
    create a clean review file (also specified in Step 8).

    Return either:
    - SUCCESS: with full review summary
    - ABORT: if no changes found to review
```

Parse the returned findings by severity.

### Step 7.5: Verify Code Review Results File Exists

**After code-review-agent returns, check that the results file was created:**

```bash
ls code-review-results/YYYY-MM-DD-issue-<number>.md
```

**If the file does NOT exist, create it yourself.** Use the review summary returned by code-review-agent to write the file in the format specified in `.claude/agents/code-review-kit.md` Step 8.

### Step 8: Report Review Findings (DO NOT FIX)

**Default behavior:** Report findings only. Do NOT auto-fix any findings. The human reviews the code review results file and decides what to fix.

Record the code review summary (severity counts and recommendation) for inclusion in the PR body and verification document.

**Override:** If the caller (e.g., batch-worker-agent) provides an explicit fix policy in the prompt, follow that policy instead of the default. The override will specify which severities to fix.

### Step 9: Create Verification Document

**Write:** `.claude/temp/VERIFICATION-<number>-REMOVE.md`

Include:

- Implementation summary (files created/modified)
- Actual command output from quality checks and tests
- Code review findings summary (severity counts, recommendation)
- All findings with file locations and descriptions (unless a fix policy override was applied)
- Additional testing notes for human

### Step 10: Verify All Changes Are Committed

Run `git status` to verify no uncommitted changes remain. In particular, check that `code-review-results/` is staged and committed. If any uncommitted changes exist, commit them now with an appropriate message.

### Step 11: Create Pull Request

```bash
git push -u origin HEAD

gh pr create --title "[Issue #<number>] <title>" --body "$(cat <<'EOF'
## Summary
Closes #<number>

<Brief description>

## Changes
- <list changes>

## Code Review Completed

| Severity | Found | Fixed | Deferred |
|----------|-------|-------|----------|
| Critical | <n>   | <n>   | 0        |
| High     | <n>   | <n>   | 0        |
| Medium   | <n>   | <n>   | <n>      |
| Low      | <n>   | 0     | <n>      |

Recommendation: <Pass / Pass with fixes>

## Testing Completed
- [x] Lint passing
- [x] Build succeeds
- [x] Tests passing

## Additional Testing Needed
- [ ] <project-specific manual testing from CLAUDE.md>

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Step 12: Return Success

```
SUCCESS: Implementation complete for Issue #<number>

Pull Request: <PR URL>
Branch: feature/issue-<number>-<description>
Commit: <commit hash>

Code review:
- Critical: <count> (all fixed)
- High: <count> (all fixed)
- Medium: <count> (<fixed>/<total>)
- Low: <count> (deferred)

Recommendation: <Pass / Pass with fixes>

Unresolved findings:
- <severity>: <file:line> — <description>
(or "None" if all findings were resolved)

Next steps for human:
1. Review PR at <PR URL>
2. Review unresolved findings above
3. Perform additional manual testing
4. Approve and merge if satisfied
```

---

## Abort Conditions

| Condition                      | Abort Message                  |
| ------------------------------ | ------------------------------ |
| Plan file missing              | "Required files not found"     |
| Task fails 3 times             | "Task failed after 3 attempts" |
| Quality checks fail repeatedly | "Cannot pass quality checks"   |
| Tests reveal fundamental issue | "Implementation does not work" |

---

## Notes

- Execute plan MECHANICALLY — follow instructions exactly
- **Commit after each completed task** — small, related commits are easier to review and revert
- Error protocol (three-strikes) is defined in `CLAUDE.md`
- All project commands (lint, build, test) come from `CLAUDE.md` — never hardcode
- Code review is delegated to code-review-agent — never review inline
- Always include ACTUAL output in verification doc
- Fix bugs discovered during testing (don't just report)
- PR must be created before returning success
