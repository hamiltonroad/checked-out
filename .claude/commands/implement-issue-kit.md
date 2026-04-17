# Implement Issue (Phase 3: Execution)

**Purpose:** Execute plan — implement changes, code review, validate, commit, create PR.

**Usage:** `/implement-issue-kit <issue-number>`

**Prerequisites:** Must run `/prep-issue-kit <number>` and `/plan-issue-kit <number>` first

**End Result:** Implementation complete, code reviewed, committed, PR created, ready for human review

---

## WHAT THIS COMMAND DOES

1. Invoke implement-agent with issue number
2. Agent executes plan step-by-step
3. Agent runs quality checks (from `CLAUDE.md`)
4. Agent spawns code-review-agent to review changes
5. Agent fixes Critical/High findings
6. Agent creates verification document, including a mandatory
   **AC Verification Table** that maps every acceptance criterion
   bullet from the issue to a concrete `expect(...)` call (with
   file:line), implementation reference, or an explicit
   "Manual verification only" note flagged for human sign-off.
   If any bullet has no evidence, the agent MUST NOT mark the task
   done — it fixes the gap or aborts with "Requirement unclear".
   (See `implement-agent.md` Step 9.5 — issue #229 item #15.)
7. Agent commits and creates PR
8. Returns PR URL with code review summary and unresolved findings

**This command does NOT:**

- Skip quality checks
- Commit code that doesn't build
- Merge the PR (human reviews and merges)

---

## EXECUTION

### Step 1: Validate Input

Extract issue number from `$ARGUMENTS`.

**If no issue number provided:**

```
Usage: /implement-issue-kit <issue-number>

Prerequisites:
1. Run /prep-issue-kit <number> first
2. Run /plan-issue-kit <number> first
```

### Step 2: Invoke Agent

```
Agent tool invocation:
- subagent_type: general-purpose
- description: "Implement issue #[NUMBER]"
- prompt: |
    You are implement-agent. Your task is to implement GitHub issue #[NUMBER].

    Prerequisites exist:
    - .claude/temp/GH-ISSUE-[NUMBER]-REMOVE.md
    - .claude/temp/PLAN-[NUMBER]-REMOVE.md

    Read `.claude/agents/implement-kit.md` and follow every instruction exactly.

    Return either:
    - SUCCESS: with PR URL, code review summary, and unresolved findings
    - ABORT: with specific blocker and suggested actions
```

### Step 3: Display Results

Show PR URL, code review summary, unresolved findings, and next steps for human review.

---

## ERROR HANDLING

- **Plan missing:** Error with instructions to run prep and plan first
- **Agent returns ABORT:** Display blocker and suggested actions
- Error protocol (three-strikes) is handled by the agent per `CLAUDE.md`

---

## NOTES

- This command delegates all work to implement-agent
- implement-agent delegates code review to code-review-agent
- All project commands and review criteria come from `CLAUDE.md`
- PR must be created before returning success
