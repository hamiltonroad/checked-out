# Sub-Agents and Planning

Task decomposition, context firewalls, and parallel execution.

## Sub-Agent Mechanics

When a sub-agent spins up:

1. Gets fresh context window (no conversation history)
2. Gets only what parent passes: task description, specific files, desired output format
3. Has access to same filesystem and tools as parent
4. Reads CLAUDE.md independently
5. Returns single result — all work distilled into return message

**High input, low output:** Sub-agent might read 20 files. Parent only sees a 500-token summary instead of absorbing 18,000 tokens.

## Context Firewalls

| Direction                  | What Crosses                                               |
| -------------------------- | ---------------------------------------------------------- |
| **Parent → Sub-agent**     | Task description, specific context, desired output format  |
| **Sub-agent → Parent**     | Condensed result, artifacts created (files, commits)       |
| **Stays inside sub-agent** | All file reads, search results, reasoning steps, dead ends |

**Why isolation helps:**

- Mistakes in one sub-agent don't pollute others
- Parent stays focused on coordination
- Sub-agents can be right-sized to task
- After 3 research tasks: 1,500 tokens of summaries vs. 45,000 without sub-agents

## Planning-First Workflow

**Always plan before code.**

### Step 1: Ask for a plan

```
Plan how you'd add user authentication to this app. Read the
existing codebase first. Tell me what approach, which files,
implementation steps. Don't write any code yet.
```

### Step 2: Review and adjust

```
Use argon2 for hashing, not bcrypt. Middleware should be
route-level, not app-level.
```

Plan becomes a contract. Once approved, agent has clear boundaries.

### Step 3: Execute step by step

```
Execute step 1: create the User entity following our base
entity pattern. Run the typecheck when done.
```

Review each step before moving to the next. Catches misalignment early.

**Why it works:**

- Without plan: agent makes 50 micro-decisions, presents finished implementation. Wrong decisions found in pile of code.
- With plan: see decisions before they become code. Wrong decisions caught cheaply.
- Plan is a recovery document — if session dies, next session knows what's done and what remains.

## Task Decomposition

### Agent-Sized Task Properties:

1. **Self-contained** — Can complete without asking questions
2. **Verifiable** — Clear success criteria (test passes, build succeeds)
3. **Scoped** — Touches bounded set of files, ideally one module
4. **Independent** — Doesn't conflict with simultaneous tasks

### Example Decomposition:

**Vibe coding:** "Implement task assignment"

**Decomposed:**

1. Add assigneeId field to Task entity
2. Create assignTask method in task service with validation
3. Add PUT endpoint for task assignment
4. Write unit tests for assignTask service method
5. Write e2e test for full assignment flow

Five bounded, verifiable tasks. Fewer decisions per task = fewer wrong decisions.

### Vertical Slices > Horizontal Layers

**Horizontal** (by layer): All entities, then all services, then all routes. Creates dependencies.

**Vertical** (by feature): Entity + service + route + test for ONE piece at a time. Each task self-contained and independently verifiable.

## Git Worktree Parallelization

Multiple Claude Code sessions need physical isolation. Git worktrees provide separate working copies.

```bash
git worktree add ../project-auth feature/add-authentication
git worktree add ../project-notifications feature/add-notifications
git worktree add ../project-search feature/add-search
```

Three directories, each on own branch. Launch Claude Code in each. Agents can't interfere.

**When parallelization helps:** Tasks clearly independent, each well-specified, clean module boundaries, mature CLAUDE.md.

**When it adds complexity:** Tasks share files, specs are vague, codebase tightly coupled, no automated verification.

## Sub-Agent Patterns

### Research-Then-Build

```
Use a sub-agent to research how payments are handled in this
codebase. Return: which files, what the flow looks like, what
patterns to follow when adding a new payment type.
```

Then plan with the research results. Two steps: research in isolation, planning with clean summary.

### Architect-Plus-Builder

Parent handles architecture/decisions. Sub-agents handle implementation.

```
Delegate step 1 to a sub-agent: create the Notification entity
following our base entity pattern. Write tests and confirm they
pass. Return file paths and summary.
```

### Test Analysis

```
Delegate to sub-agent: run full test suite and summarize what's
passing, failing, and why. Categorize failures. Don't fix, just report.
```

Gets actionable info in ~200 tokens instead of 10,000 tokens of raw output.

## Common Mistakes

| Mistake                            | Fix                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| Marathon sessions                  | Break into focused chunks; fresh session after each major task                            |
| Not planning before coding         | Always "plan this before writing code"                                                    |
| Over-decomposing simple tasks      | If task adds <1,000 tokens to context, do inline                                          |
| Not reviewing intermediate results | Execute one step, review, confirm, then move to next                                      |
| Sub-agents duplicating work        | Write precise task descriptions with specific scope, files, output format, and boundaries |

## Complete Workflow Pattern

1. **Plan the feature** — Decompose into steps, review/adjust
2. **Identify parallelism** — Which steps independent? Which sequential?
3. **Execute sequential first** — Shared foundations (entities, interfaces)
4. **Fan out to parallel sub-agents** — Independent tasks with foundation in place
5. **Review and integrate** — Check each sub-agent summary and modified files
6. **Checkpoint** — Commit, update progress, start next feature fresh
