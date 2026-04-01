# Context Management

The invisible skill that separates good from great agent-assisted development.

## Context Window Mechanics

Claude Code operates with ~200,000 tokens of working memory. If it's not in the window, it doesn't exist.

**Token basics:**

- A line of code: ~10 tokens
- A typical source file: 500-2,000 tokens
- Full test suite output: 10,000+ tokens

**Before you type your first word**, the agent has already consumed 5,000-15,000 tokens of overhead (system prompt, CLAUDE.md, tool descriptions). Multiple MCP servers can push this to a third of the window.

**Critical finding:** More context isn't better. Performance degrades as context length increases. Models pay most attention to the very beginning and very end. Models advertising 200K windows become unreliable around 130K tokens.

**A 50,000-token session with carefully chosen information will outperform a 150,000-token session stuffed with everything.**

## Context Rot

Gradual degradation of agent output quality as the context window fills. Not a cliff — a slope. No warning; just progressive decline.

**Symptoms:**

1. Agent stops following conventions it followed earlier
2. Agent re-reads files it already read
3. Agent contradicts its own earlier decisions
4. Code quality degrades (correct but generic, not "your" code)
5. Agent "forgets" the plan

**The insidious part:** Agent never tells you. Output quality drops but presentation doesn't.

## Session Lifecycle

### Four Phases:

1. **Setup** (60 seconds) — Agent reads CLAUDE.md, progress files, checks git status
2. **Execution** (most of session) — Productive work; context consumed steadily
3. **Wind-down** (you may not notice) — Context getting full; output getting generic
4. **Handoff** (most people skip this) — Commit, document, capture state

### Key Principles:

- **One task, one session.** Feature, bug fix, or refactor. One objective per session.
- **20-minute / one-commit heuristic:** No commit in 20 minutes = something is wrong (task too big, agent stuck, or session stale).
- **Signs session is stale:** Past 45 minutes on complex work, repeating corrected approaches, re-reading files, writing longer prompts to compensate.

## Compaction

When conversation approaches ~95% capacity, Claude Code summarizes older turns to free space.

**Key:** CLAUDE.md content is never compacted. It sits in the system prompt, always at full fidelity. This is why putting important rules in CLAUDE.md matters so much.

**Use `/compact` manually:**

- Before switching to new phase of work
- When you notice early context rot signs
- After long investigation with lots of file reads
- After resolving a complex bug

**Don't use `/compact`:**

- Mid-complex operation where agent needs full detail
- Right after giving critical instructions
- When you're about to end session anyway (just start fresh)

**Anti-pattern:** Re-injecting information after compaction. This fills context faster, triggers more compaction, creates a cycle. If it's important enough to survive compaction, put it in CLAUDE.md or a file.

## The Handoff Problem

### What Gets Lost Between Sessions:

- Full conversation history
- Every file the agent read
- Every decision made
- Agent's understanding of current task state

### What Survives:

- CLAUDE.md (always loaded automatically)
- The actual codebase (files on disk, git history)
- Progress files and notes
- Claude Code's built-in memory system

### Solution 1: Progress Files (Best Mechanism)

```markdown
# Progress

## Last Updated

2026-03-18, Session 3

## Completed This Session

- Implemented login endpoint (src/routes/auth.ts)
- Added JWT token generation (src/services/auth-service.ts)
- Login tests passing (tests/unit/auth-login.test.ts)

## Next Session Should

- Implement password reset flow
- Add rate limiting to auth endpoints

## Decisions Made

- JWT tokens expire after 1 hour (short-lived for security)
- Refresh tokens deferred — MVP uses re-login

## Known Issues

- None. Codebase is green.
```

Write progress files as though the reader has never seen the project before and needs to start work in 60 seconds.

### Solution 2: Descriptive Git Commits

```
# Good
a3f2c1d Add password reset confirmation endpoint
b8e4f5a Implement reset token generation and email stub

# Bad
a3f2c1d fix stuff
b8e4f5a updates
```

### Solution 3: TODO Files

```markdown
# TODO

## Current Sprint

- [x] User registration endpoint
- [x] Login with JWT
- [ ] Password reset flow
- [ ] Rate limiting on auth endpoints
```

## Common Context Leaks

| Leak                                 | Fix                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------ |
| Sessions too long without compaction | `/compact` at natural transition points                                  |
| Prompts include too much background  | Put background in CLAUDE.md or progress file                             |
| Reading entire large files           | Be surgical: "Read the `processOrder` function" or specific line range   |
| No subdirectory CLAUDE.md files      | Root CLAUDE.md stays lean; domain-specific conventions in subdirectories |
| Letting agent explore freely         | Triage first: name the file, function, line number                       |
| Unfiltered tool output               | Filter: `npm test 2>&1 \| grep -A 5 'FAIL'`                              |

## Fresh Sessions vs. Salvaging

**Start fresh when:**

- Past 45-minute mark on complex work
- Agent repeating corrected approaches
- Code quality has dropped
- Agent re-reading files
- You're writing longer and longer prompts

**The math:** Five focused sessions produce more and better output than one long marathon. Every single time.

## Cheat Sheet

**Before every session:** Read progress file, check git status, state specific task in first prompt.

**During:** Be specific in prompts, point to specific sections not whole files, filter tool output, use `/compact` when switching phases, watch for context rot.

**At checkpoints:** Commit with descriptive messages, update progress file, decide: continue (compact first) or start fresh.

**When ending:** Commit all changes, update progress file with what was done and what's next.

**Rule of thumb:** If it affects code, put it in a project file. If it affects interaction style, let memory handle it. Files are permanent, context is disposable.
