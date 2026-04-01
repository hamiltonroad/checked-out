# Plan Agent

**Purpose:** Deep analysis and comprehensive planning for issue implementation.

**Runs in:** Isolated agent context

**Input:** Issue number (provided in prompt)

**Output:** Success message OR abort with blocker

---

## Prerequisites

Files must exist (created by prep-agent):

- `.claude/temp/GH-ISSUE-<number>-REMOVE.md`
- `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md`

---

## Execution Steps

### Step 1: Validate Prerequisites

Check required files exist.

**If files missing:** ABORT with instructions to run prep-agent first.

### Step 2: Load Issue and Context Hint

Read both files and extract:

- Issue title, body, labels, comments
- Keywords from context hint
- Suggested directories for exploration

### Step 3: Load Project Context

**Always load:**

1. `CLAUDE.md` — Essential project guide, conventions, structure
2. `README.md` — Project overview (if present)

### Step 4: Explore Codebase

Use Explore subagent or direct file reads to understand:

- Current project structure and directory layout
- Existing code patterns and conventions
- How new work fits with existing code
- Integration points

### Step 5: Deep Analysis

**Search for reusable code:**

Before proposing any new helpers, utilities, or test factories, search the codebase for existing implementations that could serve the same purpose. Document what you found and, if proposing something new, explain why existing code doesn't fit.

**Understand the issue:**

- What is the actual requirement?
- What are the acceptance criteria?
- What constraints exist?
- What could go wrong?

**Identify scope:**

- Files to create/modify/delete
- Integration points

**Check for blockers:**

- Are requirements clear enough?
- Are there architectural implications?

**If blocked:** ABORT with details.

### Step 6: Create Implementation Plan

**Write:** `.claude/temp/PLAN-<number>-REMOVE.md`

Include:

- Issue summary (title, description, complexity, estimated time)
- Analysis (what needs to be done, risks)
- Files to create/modify
- Step-by-step implementation tasks with success criteria
- Testing & verification phase
- Verification checklist
- **Task Dependency Graph (DAG)** — if requested by the caller. Maps tasks to waves of parallel execution. Each task lists its ID, description, files it touches, and dependencies (other task IDs that must complete first). Tasks with no dependencies go in wave 1. Example:

```markdown
## Task Dependency Graph (DAG)

| Task ID | Description           | Files                 | Depends On |
| ------- | --------------------- | --------------------- | ---------- |
| T1      | Create types          | src/types/audit.ts    | —          |
| T2      | Implement rule runner | src/rules/runner.ts   | T1         |
| T3      | Add scoring utils     | src/utils/scoring.ts  | T1         |
| T4      | Wire up audit command | src/commands/audit.ts | T2, T3     |

### Waves

- **Wave 1:** T1 (no dependencies)
- **Wave 2:** T2, T3 (depend on T1, parallel)
- **Wave 3:** T4 (depends on T2+T3)
```

### Step 7: Return Success

```
SUCCESS: Plan complete for Issue #<number>

Plan file: .claude/temp/PLAN-<number>-REMOVE.md

Summary:
- Complexity: <Low/Medium/High>
- Tasks: <count>
- Files to modify: <count>

Ready for: implement-agent
```

---

## Abort Conditions

| Condition                 | Abort Message                        |
| ------------------------- | ------------------------------------ |
| Prep files missing        | "Prep files not found"               |
| Requirements unclear      | "Cannot proceed without human input" |
| Multiple valid approaches | "Architectural decision needed"      |

---

## Notes

- This agent does deep reasoning (may take 2-5 minutes)
- Explores codebase thoroughly before planning
- Plan should be detailed enough for mechanical execution
- If unsure about anything, abort and ask — don't guess
- Error protocol (three-strikes) is defined in `CLAUDE.md`
