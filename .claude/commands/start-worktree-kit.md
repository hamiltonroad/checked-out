# Start Worktree for Issue

**Purpose:** Create a git worktree for working on a specific GitHub issue in parallel with other work.

**Usage:** `/start-worktree-kit <issue-number>`

---

## Steps

### 1. Validate Issue Exists

```bash
gh issue view $ARGUMENTS --json number,title,body
```

If issue doesn't exist, display error and stop.

### 2. Check for Existing Worktree

```bash
git worktree list
```

If a worktree for this issue already exists, warn user and offer to use existing or recreate.

### 3. Derive Worktree Path

Use the worktree path convention from `CLAUDE.md`. Default:

```bash
PROJECT_NAME=$(basename $(git rev-parse --show-toplevel))
WORKTREE_PATH="../${PROJECT_NAME}-issue-$ARGUMENTS"
```

### 4. Create Worktree

```bash
git worktree add "$WORKTREE_PATH" -b feature/issue-$ARGUMENTS
```

### 5. Display Success Message

```
Worktree created for issue #<number>

Location: <worktree-path>
Branch: feature/issue-<number>

Next steps:
1. Open in new VS Code window:
   code <worktree-path>

2. In the new window, install dependencies:
   <install command from CLAUDE.md>

3. Start the workflow:
   /story-runner-kit <number>

   Or run phases manually:
   /prep-issue-kit <number>
   /plan-issue-kit <number>
   /implement-issue-kit <number>

---
Worktree Management:

List all worktrees:     git worktree list
Remove when done:       git worktree remove <worktree-path>
Remove branch:          git branch -d feature/issue-<number>
```

---

## Important Notes

- **Keep prep-issue unchanged** — Don't fetch or save issue details here; let `/prep-issue-kit` handle that
- **Port conflicts** — If running multiple dev servers, use different ports
- **Separate git state** — Each worktree has independent working tree and staging area
- **Shared repository** — All worktrees share the same `.git` directory

## Cleanup

When issue is complete and PR is merged:

```bash
git worktree remove <worktree-path>
git branch -d feature/issue-<number>
git push origin --delete feature/issue-<number>
```
