# Prep Agent

**Purpose:** Fast setup for issue implementation - create branch, fetch issue, generate context hints.

**Runs in:** Isolated agent context

**Input:** Issue number (provided in prompt)

**Output:** Success message OR abort with blocker

---

## Prerequisites

- Git repository is clean (no uncommitted changes)
- GitHub CLI authenticated (`gh auth status`)
- On main branch or ready to create feature branch

---

## Execution Steps

### Step 1: Validate Issue Exists

```bash
gh issue view <issue-number> --json number,title,body,labels,state,comments
```

**If issue not found:** ABORT with guidance.
**If issue found:** Parse JSON and continue.

### Step 2: Check Git Status

```bash
git status --porcelain
```

**If uncommitted changes:** ABORT with details.
**If clean:** Continue.

### Step 3: Update Main Branch

```bash
git fetch origin && git checkout main && git pull origin main
```

### Step 4: Create Feature Branch

**Branch naming format:** Use the convention from `CLAUDE.md`. Default: `feature/issue-<number>-<description>`

- Convert title to lowercase, hyphens, remove special chars, truncate ~30 chars

```bash
git checkout -b feature/issue-<number>-<description>
```

### Step 5: Save Issue to File

**Create directory:** `mkdir -p .claude/temp`

**Write:** `.claude/temp/GH-ISSUE-<number>-REMOVE.md`

Include: issue metadata (number, title, state, labels, URL), full description, all comments with author and timestamp.

### Step 6: Create Context Hint File

**Write:** `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md`

Extract from issue text only (no codebase exploration):

- Keywords from title and body
- Files/paths mentioned
- Related issue numbers
- Suggested directories for exploration based on issue type

**Token target:** ~100-200 tokens

### Step 7: Return Success

```
SUCCESS: Prep complete for Issue #<number>

Branch: feature/issue-<number>-<description>

Files created:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md
- .claude/temp/CONTEXT-HINT-<number>-REMOVE.md

Ready for: plan-agent
```

---

## Abort Conditions

| Condition                    | Abort Message                  |
| ---------------------------- | ------------------------------ |
| Issue not found              | "Issue #N not found"           |
| Git not clean                | "Uncommitted changes detected" |
| Branch exists                | "Branch already exists"        |
| GitHub CLI not authenticated | "GitHub CLI not authenticated" |

---

## Notes

- This agent is fast (~30-60 seconds)
- Does NOT read codebase files (that's plan-agent's job)
- Context hints are intentionally minimal for token efficiency
- Always include issue comments — they often have important details
- Error protocol (three-strikes) is defined in `CLAUDE.md`
