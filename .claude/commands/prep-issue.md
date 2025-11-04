# Prep Issue (Phase 1: Setup)

**Purpose:** Fast setup for issue implementation - create branch, fetch issue, guess context.

**Model:** Sonnet (fast execution)

**Usage:** `/prep-issue <issue-number>`

**Next Steps:** After this completes, run `/plan-issue <issue-number>` (uses Opus for planning)

---

## WHAT THIS COMMAND DOES


2. ✅ Create feature branch with proper naming
3. ✅ Fetch issue from GitHub and save locally
4. ✅ Guess relevant files/directories for context (smart search)
5. ✅ Set up temp workspace for planning phase

**This command does NOT:**
- ❌ Create implementation plan (that's `/plan-issue`)
- ❌ Write any code (that's `/implement-issue`)
- ❌ Load heavy project context (that's `/plan-issue` with Opus)

---

## EXECUTION STEPS

### Step 1: Validate Issue Number

**Verify issue exists and fetch all details:**
```bash
gh issue view <issue-number> --json number,title,body,labels,state,comments
```

**If issue not found:**
- ❌ Exit with error: "Issue #<number> not found. Please check the issue number."
- Do not proceed

**If issue found:**
- ✅ Parse JSON response including comments array
- ✅ Continue to Step 2

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

**Example:**
- Issue #181: "Miscellaneous cleanup: session-start review, deploy cleanup"
- Branch: `feature/issue-181-miscellaneous-cleanup`

**Create branch:**
```bash
git checkout -b feature/issue-<number>-<description>
```

**Verify:**
```bash
git branch --show-current
```

**Expected:** Branch name matches pattern `feature/issue-<number>-*`

### Step 4: Save Issue to File

**Create issue file:**
- Path: `.claude/temp/GH-ISSUE-<number>-REMOVE.md`
- Ensure directory exists: `mkdir -p .claude/temp`

**Parse comments from JSON:**
- GitHub CLI returns comments as array: `[{author: {login: "username"}, body: "comment text", createdAt: "timestamp"}, ...]`
- Include all comments in saved file with author and timestamp
- Comments often contain detailed acceptance criteria and implementation notes

**File format:**
```markdown
# Issue #<number>: <title>

**⚠️ TEMPORARY SESSION DOCUMENT - REMOVE AFTER SESSION**

This file contains GitHub issue details for planning/implementation. Remove when:
- [ ] Session is complete
- [ ] PR is merged
- [ ] Issue is closed

---

## Issue Metadata

- **Number:** #<number>
- **Title:** <title>
- **State:** <state>
- **Labels:** <labels>
- **URL:** https://github.com/hamiltonroad/checked-out/issues/<number>

---

## Issue Description

<body content from GitHub>

---

## Comments

<if comments exist, include all comments with author and timestamp>

**Comment 1 by <author> at <timestamp>:**
<comment body>

**Comment 2 by <author> at <timestamp>:**
<comment body>

<if no comments: "No comments yet.">

---

**Fetched:** <timestamp>
**Fetched by:** /prep-issue command (Sonnet)
```

### Step 5: Create Lightweight Context Hint (Token-Efficient)

**IMPORTANT: Replaced full context guess with minimal hint file to save ~4,000 tokens per issue.**

**Purpose:** Extract keywords and file references from issue to guide Opus planning

**Step 5.1: Extract information from issue**
- Parse issue title and body
- Identify key terms (e.g., "bottom bar", "History", "Achievements")
- Extract file/path references (e.g., "BottomUtilityBar.js", "app.js")
- Note related issues (e.g., "Issue #297")
- Identify relevant directories (e.g., "frontend/src/", "tests/quality/")

**Step 5.2: Create minimal context hint file**
- Path: `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md`
- **Token target:** ~100-200 tokens (vs ~2,000 for full context guess)
- **No grep/glob needed** - just parse issue text

**File format:**
```markdown
# Context Hint for Issue #<number>

**⚠️ TEMPORARY SESSION DOCUMENT - REMOVE AFTER SESSION**

Lightweight hint file to guide Opus planning. Remove when:
- [ ] Session is complete
- [ ] PR is merged

---

## Keywords Extracted from Issue

**From title:** <key terms from issue title>
**From body:** <key terms from issue description>

**Example:** book, checkout, member, library, catalog, search, reservation

---

## Files/Paths Mentioned in Issue

**To create:**
- <files mentioned as needing creation>

**To modify:**
- <files mentioned as needing modification>

**Related:**
- <related issues, plans, or reference docs mentioned>

**Example:**
- BookCard.jsx (to create)
- bookService.js (to modify)
- Book.js (model to create)
- Issue #5 (related API endpoint)

---

## Directories for Context-Fetcher

**Starting points for Opus exploration:**
- <relevant directories based on issue type>

**Example:**
- frontend/src/components/ (React components)
- frontend/src/services/ (API services)
- backend/src/controllers/ (API endpoints)
- backend/src/models/ (Database models)

---

## Related Standards

**Based on issue type:**
- <relevant standards quick-refs>

**Example:**
- standards/quick-ref/frontend-quick-ref.md (React patterns)
- standards/quick-ref/backend-quick-ref.md (Node.js/Express patterns)

---

**Generated:** <timestamp>
**Generated by:** /prep-issue command (Sonnet - keyword extraction only)
**Token cost:** ~100-200 tokens (vs ~2,000 for full context guess)
**Token savings:** ~4,000 tokens per issue (80% reduction)
**Next:** Opus will use context-fetcher agent for deep exploration
```

### Step 6: Create Temp Workspace Summary

**Output to user:**
```markdown
✅ **Prep Issue #<number> Complete**

**Branch created:** `feature/issue-<number>-<description>`

**Files created:**
- `.claude/temp/GH-ISSUE-<number>-REMOVE.md` (issue details)
- `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md` (lightweight hints for Opus)

**Next steps:**
1. Review files in `.claude/temp/` if desired
2. Run `/plan-issue <number>` to create implementation plan (uses Opus)
3. Review plan
4. Run `/implement-issue <number>` to execute plan (uses Sonnet)

**Baseline status:** ✅ All tests passing
**Branch status:** ✅ Ready for development
**Estimated prep time:** <X> seconds

**Token optimization:** Context hint file (~150 tokens) saves ~4,000 tokens vs full context guess
```

---

## ERROR HANDLING

**Issue not found:**
```
❌ Error: Issue #<number> not found in repository.

Please check:
- Issue number is correct
- Issue exists in hamiltonroad/checked-out repository
- GitHub CLI is configured (run: gh auth status)

If GitHub MCP unavailable, manually create:
.claude/temp/GH-ISSUE-<number>-REMOVE.md
.claude/temp/CONTEXT-HINT-<number>-REMOVE.md
```


**Branch already exists:**
```
❌ Error: Branch feature/issue-<number>-* already exists.

Options:
1. Delete existing branch: git branch -D feature/issue-<number>-*
2. Use existing branch: git checkout feature/issue-<number>-*
3. Choose different issue number
```

**Git not clean:**
```
⚠️ Warning: Uncommitted changes detected.

git status shows:
<output>

Options:
1. Commit changes: git add . && git commit -m "..."
2. Stash changes: git stash
3. Discard changes: git reset --hard (DESTRUCTIVE)

Proceed anyway? (not recommended)
```

---

## NOTES

- This command is FAST (~30-45 seconds, now faster without grep/glob)
- Uses Sonnet for speed
- Does not load heavy context (Opus does that in /plan-issue)
- Context hint is intentionally minimal (~150 tokens) - Opus uses context-fetcher for deep exploration
- Always run `/plan-issue` next (don't skip to /implement-issue)
- **Token optimization:** Lightweight hint file saves ~4,000 tokens per issue vs previous full context guess

---

**Related Commands:**
- `/plan-issue <number>` - Next step: Create implementation plan (Opus)
- `/implement-issue <number>` - Final step: Execute plan (Sonnet)
- `/session-start` - DEPRECATED: Use three-phase workflow instead
