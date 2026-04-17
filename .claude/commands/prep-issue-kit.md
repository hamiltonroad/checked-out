# Prep Issue (Phase 1: Setup)

**Purpose:** Fast setup for issue implementation - create branch, fetch issue, generate context hints.

**Usage:** `/prep-issue-kit <issue-number>`

**Next Steps:** After this completes, run `/plan-issue-kit <issue-number>`

---

## WHAT THIS COMMAND DOES

1. Validate issue exists on GitHub
2. Create feature branch with proper naming
3. Fetch issue from GitHub and save locally
4. Create lightweight context hint file
5. Set up temp workspace for planning phase

**This command does NOT:**

- Create implementation plan (that's `/plan-issue-kit`)
- Write any code (that's `/implement-issue-kit`)

---

## EXECUTION STEPS

### Step 1: Validate Issue Number

```bash
gh issue view <issue-number> --json number,title,body,labels,state,comments
```

**If issue not found:** Exit with error.
**If issue found:** Parse JSON and continue.

### Step 2: Check Git Status

```bash
git status --porcelain
```

If uncommitted changes exist, warn user and suggest options (commit, stash, or discard).

### Step 3: Update Main Branch

```bash
git fetch origin && git checkout main && git pull origin main
```

### Step 4: Create Feature Branch

**Branch naming format:** Use convention from `CLAUDE.md`. Default:

```
feature/issue-<number>-<description>
```

- Convert title to lowercase, replace spaces with hyphens, remove special chars, truncate to ~30 chars

```bash
git checkout -b feature/issue-<number>-<description>
```

### Step 5: Save Issue to File

**Create:** `.claude/temp/GH-ISSUE-<number>-REMOVE.md`

Include: issue metadata, full description, all comments with author and timestamp.

### Step 6: Create Context Hint File

**Create:** `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md`

Extract from issue text (no codebase exploration needed):

- Key terms from title and body
- Files/paths mentioned
- Related issue numbers
- Suggested directories for exploration
- Relevant areas of the codebase

**Token target:** ~100-200 tokens

### Step 7: Output Summary

```
Prep Issue #<number> Complete

Branch created: feature/issue-<number>-<description>

Files created:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md
- .claude/temp/CONTEXT-HINT-<number>-REMOVE.md

Next steps:
1. Run /plan-issue-kit <number> to create implementation plan
2. Review plan
3. Run /implement-issue-kit <number> to execute plan
```

---

## ERROR HANDLING

- **Issue not found:** Error with guidance to check issue number and gh auth
- **Branch already exists:** Offer to use existing or delete and recreate
- **Git not clean:** Warn with options (commit, stash, discard)

---

## NOTES

- This command is FAST (~30-45 seconds)
- Does not load heavy context
- Always run `/plan-issue-kit` next (don't skip to /implement-issue-kit)
