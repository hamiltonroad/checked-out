# Story Runner

**Purpose:** Run complete issue workflow via agents with minimal context usage.

**Usage:** `/story-runner <issue-number>`

---

## Overview

This command orchestrates agents to complete a GitHub issue:

1. **prep-agent** - Fetch issue, create branch, generate context hints
2. **plan-agent** - Deep analysis, create implementation plan
3. **implement-agent** - Execute plan, test, commit, create PR
4. **code-review** - Review changes, fix Critical/High/Medium findings, commit fixes

Each agent runs in an isolated context, preserving your main context window.

---

## Execution

### Step 1: Validate Input

Extract issue number from command argument: `$ARGUMENTS`

**If no issue number provided:**

```
Usage: /story-runner <issue-number>

Example: /story-runner 42
```

### Step 2: Spawn prep-agent

**Launch agent using Agent tool:**

```
Agent tool invocation:
- subagent_type: general-purpose
- model: haiku
- prompt: |
    You are prep-agent. Your task is to prepare for implementing GitHub issue #<number>.

    Follow the instructions in the prep-agent definition exactly.

    Return either:
    - SUCCESS: with summary of what was created
    - ABORT: with specific blocker and suggested actions
```

**Wait for agent response.**

**On SUCCESS:** Continue to Step 3
**On ABORT:** Display blocker and stop.

### Step 3: Spawn plan-agent

**Launch agent using Agent tool:**

```
Agent tool invocation:
- subagent_type: general-purpose
- model: opus
- prompt: |
    You are plan-agent. Your task is to create an implementation plan for GitHub issue #<number>.

    Prerequisites exist:
    - .claude/temp/GH-ISSUE-<number>-REMOVE.md
    - .claude/temp/CONTEXT-HINT-<number>-REMOVE.md

    Follow the instructions in the plan-agent definition exactly.

    Return either:
    - SUCCESS: with summary of plan created
    - ABORT: with specific blocker and suggested actions
```

**Wait for agent response.**

**On SUCCESS:** Continue to Step 4
**On ABORT:** Display blocker and stop.

### Step 4: Spawn implement-agent

**Launch agent using Agent tool:**

```
Agent tool invocation:
- subagent_type: general-purpose
- prompt: |
    You are implement-agent. Your task is to implement GitHub issue #<number>.

    Prerequisites exist:
    - .claude/temp/GH-ISSUE-<number>-REMOVE.md
    - .claude/temp/PLAN-<number>-REMOVE.md

    Follow the instructions in the implement-agent definition exactly.

    Return either:
    - SUCCESS: with PR URL and summary
    - ABORT: with specific blocker and suggested actions
```

**Wait for agent response.**

**On SUCCESS:** Continue to Step 5
**On ABORT:** Display blocker and stop.

### Step 5: Code Review and Fix

**This step runs code review, fixes findings, and commits the results.**

#### Step 5.1: Run code-review-pr

Use the Skill tool to invoke the `code-review-pr` skill with the issue number:

```
Skill tool invocation:
- skill: "code-review-pr"
- args: "<number>"
```

This spawns code-review-agent which reviews the diff and creates `code-review-results/YYYY-MM-DD-issue-<number>.md`.

#### Step 5.2: Verify Results File

```bash
ls code-review-results/*-issue-<number>.md
```

If the file does not exist, display a warning but continue to Step 6 (non-blocking).

#### Step 5.3: Apply Fix Policy

Read the code review results file and apply fixes:

- **Must fix:** All Critical, High, and Medium findings
- **May fix:** Low findings — fix if straightforward and clearly beneficial, otherwise defer
- After fixes, re-run quality checks (lint, format, test)

#### Step 5.4: Enforce Critical/High Gate

After applying fixes, if ANY Critical or High finding remains unresolved:

1. Attempt to fix the finding and re-run quality checks, OR
2. Display a warning — do NOT block the PR, but clearly flag it for human review

#### Step 5.5: Commit

If fixes were applied:

```bash
git add <fixed files> code-review-results/
git commit -m "fix: address code review findings for issue #<number>

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

If no fixes needed, just commit the review results file:

```bash
git add code-review-results/
git commit -m "docs: record code review findings for issue #<number>

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

Record code review summary for display in Step 6.

### Step 6: Success - Display Completion

```
STORY RUNNER COMPLETE

Issue: #<number>
Pull Request: <PR URL from implement-agent>

All phases completed:
- prep-agent: Branch created, issue fetched
- plan-agent: Implementation plan created
- implement-agent: Code implemented, tested, PR created
- code-review: Reviewed, findings fixed, results committed

Code Review:
- Critical: <count> (all fixed)
- High: <count> (all fixed)
- Medium: <count> (<fixed>/<total>)
- Low: <count> (deferred)
- Recommendation: <Pass / Pass with fixes>

Next steps:
1. Review PR at <PR URL>
2. Perform any additional manual testing
3. Approve and merge if satisfied
4. Clean up: rm .claude/temp/*-<number>-REMOVE.md
```

---

## Error Handling

If an agent doesn't respond or returns unexpected results, display the phase, issue number, and suggested recovery actions (resume manually with individual phase commands).

---

## Related Commands

- `/prep-issue <n>` - Just prep phase
- `/plan-issue <n>` - Just planning phase
- `/implement-issue <n>` - Just implementation phase
- `/code-review-pr <n>` - Review PR against standards
