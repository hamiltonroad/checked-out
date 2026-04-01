# Audit Checklist and Diagnostics

The complete checklist, diagnostic framework, and failure patterns that harness-cli implements.

## Self-Assessment Checklist (25+ Items)

### Instructions and Knowledge

- [ ] Project-level CLAUDE.md file exists
- [ ] Lists tech stack with specific versions
- [ ] Describes architecture (directories, layers, data flow)
- [ ] Includes concrete code examples of patterns (not just names)
- [ ] Specifies what the agent should NOT do (constraints)
- [ ] Folder-level CLAUDE.md files for areas with specific conventions
- [ ] CLAUDE.md updated when gaps discovered (living document)

### Verification and Back-Pressure

- [ ] Hooks run linter after file writes
- [ ] Hooks run test suite before commits
- [ ] Hooks or checks catch forbidden patterns
- [ ] Agent runs tests as part of workflow (not just when reminded)
- [ ] Failed checks give agent clear, actionable feedback

### Constraints and Governance

- [ ] Permission settings match risk level of operations
- [ ] Files/directories that are off-limits are defined
- [ ] Rules about complexity/scope (when to create new files)
- [ ] Agent can't make destructive operations without confirmation

### Context Management

- [ ] Sessions scoped to specific tasks (not open-ended)
- [ ] /compact used proactively before context degrades
- [ ] New sessions started rather than salvaging confused ones
- [ ] Sub-agents used for side investigations

### Tools and Capabilities

- [ ] MCP servers set up for needed external tools
- [ ] Tool access scoped appropriately (read-only where needed)
- [ ] Agent has tools to verify its own work

### State and Continuity

- [ ] ~/.claude/ memory is curated, not just accumulated
- [ ] Agent starts each session with enough context to be productive
- [ ] Critical project decisions documented where agent can access them

### Scoring

- **20+ checked**: Solid harness
- **12-19**: Decent foundation with significant gaps
- **6-11**: Major leaks; start with instruction files and architecture
- **Under 6**: Harness mostly absent; first improvements will have dramatic impact

## Five-Question Diagnostic (Debugging Agent Failures)

### 1. Did it have the right context?

What files were in scope? Did it know about shared utilities? Architecture documentation?
**Fix:** Add file paths to CLAUDE.md. Use explicit instructions: "Before implementing validation, read src/shared/utils/validation.ts"

### 2. Did it have the right instructions?

Were CLAUDE.md entries clear? Specific? Contradictory? Gaps where agent improvised?
**Fix:** Update CLAUDE.md with specificity. Instead of "follow established patterns," write "new endpoints must use format in src/shared/utils/response.ts"

### 3. Did it have too much context?

How long was the session? How many files read? Quality degrade over time?
**Fix:** Use /compact more aggressively. Shorter sessions. Fresh session beats stale session.

### 4. Did back-pressure catch it?

Did agent run tests? Did tests cover the failure? Linter check the pattern?
**Fix:** Add the missing check: new test, new linter rule, new hook. Make failure impossible to repeat silently.

### 5. Was the task too big?

How many files did it touch? Did it loop without progress?
**Fix:** Decompose. "Implement entire search" is too big. Break into self-contained pieces.

**Shortcut:** "If I gave this task to a competent developer with the same information, would they make the same mistake?"

- Yes → Fix inputs (spec unclear, context missing, scope unreasonable)
- No → Need better mechanical constraints

## Seven Common Failure Patterns

### 1. Agent Rewrites Working Code

**Why:** Can't resist "improving" code it passes through.
**Fixes:**

- CLAUDE.md: "Do not modify code outside current task scope unless explicitly asked"
- Add tests for touched code (unauthorized changes visible immediately)

### 2. Agent Uses Wrong Patterns

**Why:** Didn't see existing examples, or saw conflicting examples and picked wrong one.
**Fixes:**

- Concrete examples in CLAUDE.md with specific file references
- Linter rules checking for anti-patterns
- Fix existing code demonstrating wrong pattern (agent learns from what it sees)

### 3. Agent Loses Track Mid-Session

**Why:** Context rot. Most predictable failure mode in long sessions.
**Fixes:**

- /compact proactively
- 20-minute focused sessions
- **Doom loop indicator:** 3+ edits to same file without tests improving = kill and restart

### 4. Agent Over-Engineers

**Why:** Defaults to general solutions; doesn't know requirements are narrow.
**Fixes:**

- CLAUDE.md: "Prefer simplest implementation. No abstraction layers unless explicitly requested."
- Specific prompts: "Just the function — no class, no configuration, no options object"

### 5. Agent Creates Circular Dependencies

**Why:** Doesn't maintain mental model of dependency graph.
**Fixes:**

- Document dependency rules: "Routes → Services → Repositories. Nothing depends on Routes."
- Add circular import detection tool (madge for JS, import-linter for Python)

### 6. Agent Breaks Unrelated Things

**Why:** "Helpfully" fixes what it thinks are related issues.
**Fixes:**

- Explicit scope boundaries: "Task involves only files in src/users/"
- Tests for adjacent features

### 7. Agent Ignores Instructions

**Why:** CLAUDE.md too long, instruction lost in noise. Or instruction conflicts with codebase patterns.
**Fixes:**

- Shorten CLAUDE.md (over 60 lines = more likely to miss individual instructions)
- Move instruction to mechanical check (linter rule or hook)
- Make sure codebase demonstrates the rule

## The Iteration Loop

When something goes wrong:

1. **Identify** the specific failure (not "code broken" but "agent put auth in route handler instead of service layer")
2. **Determine** which harness component should have prevented it
3. **Update** that component (add rule, write test, fix structure)
4. **Verify** by starting new session with same task

Step 3 produces a permanent fix for every future session. After 50 iterations, 50 compounded improvements.

**The amateur** fixes code and moves on. **The harness engineer** fixes code and asks "What should have prevented this?"

## Entropy and Anti-Bloat

### The Bloat Problem

Natural tendency to only add, never remove. 6 months in: CLAUDE.md 200 lines, 15 hooks, maze of special cases.

### Pruning Practice (Every Audit)

Remove at least one thing.

1. **Classify each entry:** Model-specific workaround (disposable) or permanent business rule (keeps)?
2. **Test removals:** Remove, see if agent does right thing without it. If yes, delete.
3. **Consolidate:** 5 error handling entries → 1 section.
4. **Prefer mechanical enforcement:** Every CLAUDE.md entry replaceable by linter/hook should be.

### Harness Debt Types

1. **Stale CLAUDE.md** — Rules pointing to non-existent paths
2. **Broken hooks** — Silently failing or false positives
3. **Convention drift** — Half the codebase follows pattern A, half pattern B
4. **Tool rot** — MCP servers for unused services
5. **Context bloat** — Too many rules; signal lost in noise
6. **Unmaintained memory** — Stale memories contradicting CLAUDE.md

## Maintenance Cadence

**Monthly (1 hour):**

- Review CLAUDE.md for staleness and contradictions
- Check hooks are running and catching real issues
- Review 5-10 recent sessions for patterns
- Spot-check code for convention drift
- Remove at least one unused rule/hook

**After Major Changes:**

- Full CLAUDE.md audit
- Check all hooks still match codebase
- Audit tool access and permissions

**Quarterly:**

- Deep review of memory; clean stale context
- Assess overall harness health
- Plan improvements

## Common Harness Leak Symptoms

| Symptom                                        | Likely Leak                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| Agent rewrites files not asked to modify       | Missing scope boundaries; no hooks catching out-of-scope modifications   |
| Agent uses wrong patterns/frameworks           | CLAUDE.md lacks concrete examples; no linting catching mismatches        |
| Agent loses track mid-session                  | Context overflow; sessions too long/broad                                |
| Agent makes confident but wrong changes        | No verification; no hooks running tests after implementation             |
| Must repeat same instructions every session    | Instructions in conversation, not in CLAUDE.md                           |
| Agent creates unnecessary files/over-engineers | No constraints on scope/complexity                                       |
| Agent ignores project conventions              | Conventions not documented specifically enough; no enforcement mechanism |
| Agent ignores instructions                     | CLAUDE.md too long; instructions conflict with codebase patterns         |
