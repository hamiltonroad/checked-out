# Prep Agent

**Purpose:** Fast setup for issue implementation - create branch, fetch issue.

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

Fetch issue from GitHub with all details:

```bash
gh issue view <issue-number> --json number,title,body,labels,state,comments
```

**If issue not found:**
```
ABORT: Issue #<number> not found.

Suggested actions:
1. Verify issue number is correct
2. Check issue exists: gh issue view <number>
3. Ensure GitHub CLI is authenticated: gh auth status
```

**If issue found:** Parse JSON and continue.

### Step 2: Check Git Status

```bash
git status --porcelain
```

**If uncommitted changes exist:**
```
ABORT: Uncommitted changes detected.

<git status output>

Suggested actions:
1. Commit changes: git add . && git commit -m "WIP"
2. Stash changes: git stash
3. Discard changes: git checkout -- . (DESTRUCTIVE)
```

**If clean:** Continue.

### Step 3: Create Feature Branch

**Branch naming format:**
```
feature/issue-<number>-<description>
```

**Extract description from issue title:**
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Truncate to ~30 characters

**Create branch:**
```bash
git checkout -b feature/issue-<number>-<description>
```

**If branch already exists:**
```
ABORT: Branch feature/issue-<number>-* already exists.

Suggested actions:
1. Use existing branch: git checkout feature/issue-<number>-*
2. Delete and recreate: git branch -D feature/issue-<number>-* && git checkout -b feature/issue-<number>-<desc>
3. Choose a different issue
```

### Step 4: Save Issue to File

**Create directory if needed:**
```bash
mkdir -p .claude/temp
```

**Write file:** `.claude/temp/GH-ISSUE-<number>-REMOVE.md`

**Format:**
```markdown
# Issue #<number>: <title>

**TEMPORARY SESSION DOCUMENT - REMOVE AFTER SESSION**

---

## Issue Metadata

- **Number:** #<number>
- **Title:** <title>
- **State:** <state>
- **Labels:** <labels>
- **URL:** https://github.com/<owner>/<repo>/issues/<number>

---

## Issue Description

<body content from GitHub>

---

## Comments

<For each comment:>

**Comment by <author.login> at <createdAt>:**
<comment body>

<If no comments: "No comments yet.">

---

**Fetched:** <timestamp>
**Fetched by:** prep-agent
```

### Step 5: Return Success

**Success output:**
```
SUCCESS: Prep complete for Issue #<number>

Branch: feature/issue-<number>-<description>

Files created:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md

Ready for: plan-agent
```

---

## Abort Conditions

| Condition | Abort Message |
|-----------|---------------|
| Issue not found | "Issue #N not found" |
| Git not clean | "Uncommitted changes detected" |
| Branch exists | "Branch already exists" |
| GitHub CLI not authenticated | "GitHub CLI not authenticated" |

---

## Notes

- This agent is fast (~30-60 seconds)
- Does NOT read codebase files (that's plan-agent's job)
- Does NOT create context hint files (codebase context is now gathered by `/refine-issue` before prep runs)
- Always include issue comments -- they often have important details, including refinement data from `/refine-issue`
