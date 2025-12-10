# Story Runner

**Purpose:** Run complete issue workflow via agents with minimal context usage.

**Usage:** `/story-runner <issue-number>`

**Model:** Sonnet (orchestration only)

---

## Overview

This command orchestrates three agents to complete a GitHub issue:

1. **prep-agent** - Fetch issue, create branch, generate context hints
2. **plan-agent** - Deep analysis, create implementation plan
3. **implement-agent** - Execute plan, test, commit, create PR

Each agent runs in an isolated context, preserving your main context window for other work.

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

**Launch agent using Task tool:**

```
Task tool invocation:
- subagent_type: general-purpose
- prompt: |
    You are prep-agent. Your task is to prepare for implementing GitHub issue #<number>.

    Follow the instructions in .claude/agents/prep-agent.md exactly.

    Return either:
    - SUCCESS: with summary of what was created
    - ABORT: with specific blocker and suggested actions
```

**Wait for agent response.**

**On SUCCESS:** Continue to Step 3

**On ABORT:** Display blocker and stop:
```
STORY RUNNER ABORTED

Phase: prep-agent
Issue: #<number>

<blocker message from agent>

Files created so far:
<list any files that exist in .claude/temp/>

Suggested actions:
<actions from agent>
```

### Step 3: Spawn plan-agent

**Launch agent using Task tool:**

```
Task tool invocation:
- subagent_type: general-purpose
- prompt: |
    You are plan-agent. Your task is to create an implementation plan for GitHub issue #<number>.

    Prerequisites exist:
    - .claude/temp/GH-ISSUE-<number>-REMOVE.md
    - .claude/temp/CONTEXT-HINT-<number>-REMOVE.md

    Follow the instructions in .claude/agents/plan-agent.md exactly.

    Return either:
    - SUCCESS: with summary of plan created
    - ABORT: with specific blocker and suggested actions
```

**Wait for agent response.**

**On SUCCESS:** Continue to Step 4

**On ABORT:** Display blocker and stop:
```
STORY RUNNER ABORTED

Phase: plan-agent
Issue: #<number>

<blocker message from agent>

Files created so far:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md
- .claude/temp/CONTEXT-HINT-<number>-REMOVE.md
- .claude/temp/PLAN-<number>-REMOVE.md (partial, if created)

Suggested actions:
<actions from agent>
```

### Step 4: Spawn implement-agent

**Launch agent using Task tool:**

```
Task tool invocation:
- subagent_type: general-purpose
- prompt: |
    You are implement-agent. Your task is to implement GitHub issue #<number>.

    Prerequisites exist:
    - .claude/temp/GH-ISSUE-<number>-REMOVE.md
    - .claude/temp/PLAN-<number>-REMOVE.md

    Follow the instructions in .claude/agents/implement-agent.md exactly.

    Return either:
    - SUCCESS: with PR URL and summary
    - ABORT: with specific blocker and suggested actions
```

**Wait for agent response.**

**On SUCCESS:** Display completion message (Step 5)

**On ABORT:** Display blocker and stop:
```
STORY RUNNER ABORTED

Phase: implement-agent
Issue: #<number>

<blocker message from agent>

Files created:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md
- .claude/temp/CONTEXT-HINT-<number>-REMOVE.md
- .claude/temp/PLAN-<number>-REMOVE.md
- .claude/temp/VERIFICATION-<number>-REMOVE.md (partial, if created)

Branch: feature/issue-<number>-* (check git branch)

Suggested actions:
<actions from agent>
```

### Step 5: Success - Display Completion

```
STORY RUNNER COMPLETE

Issue: #<number>
Pull Request: <PR URL from implement-agent>

All phases completed:
- prep-agent: Branch created, issue fetched
- plan-agent: Implementation plan created
- implement-agent: Code implemented, tested, PR created

Files in .claude/temp/:
- GH-ISSUE-<number>-REMOVE.md
- CONTEXT-HINT-<number>-REMOVE.md
- PLAN-<number>-REMOVE.md
- VERIFICATION-<number>-REMOVE.md

Next steps:
1. Review PR at <PR URL>
2. Perform any additional manual testing
3. Approve and merge if satisfied
4. Clean up: rm .claude/temp/*-<number>-REMOVE.md
```

---

## Error Handling

### Agent Timeout

If an agent doesn't respond within expected time:
```
STORY RUNNER TIMEOUT

Phase: <agent-name>
Issue: #<number>

Agent did not complete within expected time.

Suggested actions:
1. Check .claude/temp/ for partial files
2. Resume manually: /<phase>-issue <number>
3. Retry: /story-runner <number>
```

### Unexpected Error

If agent returns unexpected response:
```
STORY RUNNER ERROR

Phase: <agent-name>
Issue: #<number>

Unexpected agent response:
<response content>

Suggested actions:
1. Check agent definition: .claude/agents/<agent>-agent.md
2. Resume manually: /<phase>-issue <number>
3. Report issue if recurring
```

---

## Notes

- Each agent runs in isolated 200k context
- Main context usage: ~2-5k tokens (orchestration only)
- Agents communicate via files in .claude/temp/
- Original slash commands still work for manual control
- Use worktrees for parallel issue work

---

## Related Commands

**Manual workflow (individual phases):**
- `/prep-issue <n>` - Just prep phase
- `/plan-issue <n>` - Just planning phase
- `/implement-issue <n>` - Just implementation phase

**Supporting commands:**
- `/code-review-pr <n>` - Review PR against standards
- `/start-worktree <n>` - Create parallel worktree for issue
