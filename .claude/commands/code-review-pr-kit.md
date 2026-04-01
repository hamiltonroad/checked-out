# Code Review PR

**Purpose:** Run a code review on the current PR or diff.

**Usage:** `/code-review-pr [issue-number]`

---

## WHAT THIS COMMAND DOES

1. Invoke code-review-agent with issue number
2. Agent reviews diff against universal checks and project-specific criteria from `CLAUDE.md`
3. Agent categorizes findings by severity
4. Agent returns comprehensive summary
5. Human reviews findings and decides what to fix

---

## EXECUTION

### Step 1: Determine Issue Number

If provided in command, use it. Otherwise extract from branch name or ask user.

### Step 2: Invoke Agent

```
Agent tool invocation:
- subagent_type: general-purpose
- description: "Code review for issue #[NUMBER]"
- prompt: |
    You are code-review-agent. Perform comprehensive code review for Issue #[NUMBER].

    First, read .claude/agents/code-review-kit.md and follow every step exactly.

    MANDATORY OUTPUT: You MUST create the file code-review-results/YYYY-MM-DD-issue-[NUMBER].md
    (using today's date). This is non-negotiable — a missing file means the review never happened.
    Follow the exact format specified in Step 8 of your agent definition. If no findings exist,
    create a clean review file (also specified in Step 8).

    Return either:
    - SUCCESS: with full review summary
    - ABORT: if no changes found to review
```

### Step 3: Display Results and Next Steps

Show the full review summary from the agent, then prompt:

```
Next steps:
1. Fix Critical and High findings before merging
2. Consider fixing Medium findings
3. Low findings can be deferred

To apply fixes automatically, ask me to fix the Critical/High findings.
```
