# Refine Issue

**Purpose:** Enrich one or more GitHub issues with implementation context: ADRs, OpenAPI changes, likely affected files, dependency maps, and UI specs.

**Usage:** `/refine-issue-kit <issue-1> [issue-2] [issue-3]`

**Example:** `/refine-issue-kit 180 181 182`

**Next Steps:** After refinement, run `/story-runner-kit <number>` or `/batch-runner-kit <n1> <n2>` to implement.

---

## WHAT THIS COMMAND DOES

1. Fetch each issue from GitHub
2. Audit codebase to identify relevant ADRs, OpenAPI changes, and affected files
3. Interview human on suggested ADRs (batched across all issues)
4. Generate UI component spec when frontend work is involved
5. Map cross-issue dependencies (when multiple issues provided)
6. Append a refinement comment to each GitHub issue

**This command does NOT:**

- Create branches or write code (that's `/prep-issue-kit` and `/implement-issue-kit`)
- Create implementation plans (that's `/plan-issue-kit`)
- Modify any files in the repository

---

## EXECUTION STEPS

### Step 1: Parse and Validate Input

Extract issue numbers from `$ARGUMENTS`.

**Validation rules:**

- Must contain one or more space-separated positive integers
- No duplicates

**If validation fails:**

```
Usage: /refine-issue-kit <issue-1> [issue-2] [issue-3]

Example: /refine-issue-kit 180 181 182

Provide one or more GitHub issue numbers to refine.
```

### Step 2: Verify Issues Exist

For each issue number:

```bash
gh issue view <N> --json number,title,state
```

**If any issue not found:** Display which issues were not found and abort.

**If all found:** Display list and continue.

### Step 3: Spawn Refine Agent

```
Agent tool invocation:
- subagent_type: general-purpose
- model: opus
- description: "Refine issues: #<N1>, #<N2>, ..."
- prompt: |
    You are refine-agent. Your task is to enrich GitHub issues with implementation context.

    Issues to refine: <N1>, <N2>, ...

    Read `.claude/agents/refine-kit.md` and follow every step exactly.

    Return either:
    - SUCCESS: with list of refined issues and summary
    - ABORT: with specific blocker and suggested actions
```

### Step 4: Display Results

**On SUCCESS:**

```
Refinement complete.

Issues refined:
- #<N1>: <title>
- #<N2>: <title>

Each issue now has a refinement comment with:
- Referenced and suggested ADRs
- OpenAPI changes
- Likely affected files
- Cross-issue dependencies
- UI spec (if applicable)

Next steps:
1. Review refinement comments on GitHub
2. Run /story-runner-kit <N> or /batch-runner-kit <N1> <N2> to implement
```

**On ABORT:** Display blocker and suggested actions.

---

## ERROR HANDLING

- **Invalid input:** Display usage with example
- **Issues not found:** List missing issues, suggest checking issue numbers
- **Agent abort:** Display blocker from refine-agent
- **GH CLI failure:** Suggest checking `gh auth status`

---

## NOTES

- Refinement is a one-time enrichment step -- run it once before implementation
- When multiple issues are passed, ADR questions are batched (not asked one at a time)
- The refinement comment becomes input for plan-agent via the GH-ISSUE file
- Issues should be refined BEFORE running `/story-runner-kit` or `/batch-runner-kit`
