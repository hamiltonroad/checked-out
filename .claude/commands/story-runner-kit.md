# Story Runner

**Purpose:** Run complete issue workflow via agents with minimal context usage.

**Usage:** `/story-runner <issue-number>`

---

## Overview

This command orchestrates three agents to complete a GitHub issue:

1. **prep-agent** - Fetch issue, create branch, generate context hints
2. **plan-agent** - Deep analysis, create implementation plan
3. **implement-agent** - Execute plan, test, commit, create PR

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

**On SUCCESS:** Display completion message (Step 5)
**On ABORT:** Display blocker and stop.

### Step 5: Success - Display Completion

```
STORY RUNNER COMPLETE

Issue: #<number>
Pull Request: <PR URL from implement-agent>

All phases completed:
- prep-agent: Branch created, issue fetched
- plan-agent: Implementation plan created
- implement-agent: Code implemented, tested, PR created

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
