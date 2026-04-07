# Story Runner (with Smoke Test Gates)

**Purpose:** Run complete issue workflow via agents with smoke test pre-flight and post-flight gates.

**Usage:** `/story-runner <issue-number>`

---

## Overview

This command wraps `/story-runner-kit` with Playwright smoke test gates to ensure:
1. The app is healthy BEFORE starting work (pre-flight)
2. The app is still healthy AFTER work completes (post-flight)

If the pre-flight fails, work does not begin. If the post-flight fails, the PR is flagged as potentially broken.

**Recommended workflow:** Run `/generate-issue` and `/refine-issue` before invoking this command. Refinement enriches the issue with ADRs, affected files, and UI specs, which downstream agents consume.

---

## Execution

### Step 1: Validate Input

Extract issue number from command argument: `$ARGUMENTS`

**If no issue number provided:**

```
Usage: /story-runner <issue-number>

Example: /story-runner 42
```

### Step 1.5: CLAUDE.md Size Warning

Check the line count of `CLAUDE.md`:

```bash
wc -l < CLAUDE.md
```

If the count exceeds 100, emit this warning (do NOT abort):

```
WARNING: CLAUDE.md is now <N> lines (>100). Time to consider pruning.
See standards/harness-prune-checklist.md for the prune-cycle steps.
```

### Step 2: Pre-Flight Smoke Test

Run the smoke test script (starts servers if needed):

```bash
./scripts/smoke-test.sh --start-servers
```

**If exit code is non-zero:** Display the output and abort. Do NOT proceed to Step 3.

**If exit code is 0:** Continue to Step 3.

### Step 3: Execute Story Runner Kit

Run the existing story-runner-kit workflow:

Invoke `/story-runner-kit <issue-number>`

This orchestrates prep-agent, plan-agent, and implement-agent as usual.

**Wait for completion.** Capture the result (SUCCESS with PR URL, or ABORT with blocker).

**If ABORT:** Display the blocker and stop. Do NOT run post-flight.

### Step 4: Post-Flight Smoke Test

Run the smoke test script:

```bash
./scripts/smoke-test.sh
```

**If exit code is non-zero:** Report warning with PR URL but do NOT revert work.

**If exit code is 0:** Continue to Step 5.

### Step 5: Display Completion

```
STORY RUNNER COMPLETE

Issue: #<number>
Pull Request: <PR URL from story-runner-kit>

Smoke Tests:
  Pre-flight:  PASS
  Post-flight: PASS

All phases completed:
- Pre-flight smoke test: App healthy before work
- prep-agent: Branch created, issue fetched
- plan-agent: Tactical edit plan created
- implement-agent: Code implemented, tested, PR created
- Post-flight smoke test: App still healthy after work

Next steps:
1. Review PR at <PR URL>
2. Perform any additional manual testing
3. Approve and merge if satisfied
4. Clean up: rm .claude/temp/*-<number>-REMOVE.md
```

---

## Error Handling

- **Servers won't start:** Show start-all.sh output and suggest checking database/ports
- **Pre-flight fails:** Abort before any work begins (clean abort)
- **Story-runner-kit fails:** Display blocker, skip post-flight
- **Post-flight fails:** Report warning but do NOT revert work (PR exists for review)

---

## Related Commands

- `/generate-issue <statement>` - Create a new issue from a value statement
- `/refine-issue <n1> <n2> ...` - Enrich issues with ADRs, affected files, UI specs
- `/story-runner-kit <n>` - Inner workflow (no smoke test gates)
- `/batch-runner <n1> <n2> ...` - Parallel issues with smoke test gates
- `/prep-issue <n>` - Just prep phase
- `/plan-issue <n>` - Just planning phase
- `/implement-issue <n>` - Just implementation phase
