# Start Worktree for Issue

**Purpose:** Create a git worktree for working on a specific GitHub issue in parallel with other work.

**Model:** Sonnet (fast execution)

**Usage:** `/start-worktree <issue-number>`

---

## Your Task

Create a git worktree for GitHub issue #{issue_number} to enable parallel development.

## Steps

### 1. Validate Issue Exists

Fetch the issue from GitHub to verify it exists:

```bash
gh issue view {issue_number} --json number,title,body
```

If issue doesn't exist, display error and stop.

### 2. Check for Existing Worktree

Check if a worktree for this issue already exists:

```bash
git worktree list
```

If `../checked-out-issue-{issue_number}` already exists:
- Display: "⚠️ Worktree for issue #{issue_number} already exists at ../checked-out-issue-{issue_number}"
- Ask user if they want to remove and recreate, or just open existing
- Stop (don't create duplicate)

### 3. Create Worktree

Create the worktree in a parallel directory:

```bash
git worktree add ../checked-out-issue-{issue_number} -b feature/issue-{issue_number}
```

Handle potential errors:
- If branch already exists: Display error, suggest using different branch name or removing old branch
- If directory already exists: Display error, suggest removing directory first

### 4. Display Success Message

Show the user what was created and next steps:

```
✅ Worktree created for issue #{issue_number}

📁 Location: ../checked-out-issue-{issue_number}
🌿 Branch: feature/issue-{issue_number}

Next steps:
1. Open in new VS Code window:
   code ../checked-out-issue-{issue_number}

2. In the new window, install dependencies:
   cd backend && npm install
   cd ../frontend && npm install

3. Start the three-phase workflow:
   /prep-issue {issue_number}
   /plan-issue {issue_number}
   /implement-issue {issue_number}

───────────────────────────────────────
Worktree Management:

List all worktrees:     git worktree list
Remove when done:       git worktree remove ../checked-out-issue-{issue_number}
Remove branch:          git branch -d feature/issue-{issue_number}
```

## Important Notes

- **Keep prep-issue unchanged** - Don't fetch or save issue details here; let `/prep-issue` handle that in the new worktree
- **Shared database** - All worktrees connect to the same MySQL database
- **Port conflicts** - If running multiple dev servers, override ports:
  - Backend: `PORT=3001 npm run dev`
  - Frontend: `VITE_PORT=5174 npm run dev`
- **Separate git state** - Each worktree has independent working tree and staging area
- **Shared repository** - All worktrees share the same `.git` directory

## Error Handling

If worktree creation fails:
1. Display the exact error message
2. Suggest common fixes:
   - Branch name conflict: Choose different branch name
   - Directory exists: Remove directory or use different location
   - Uncommitted changes: Stash or commit changes first

## Cleanup Reminder

When issue is complete and PR is merged:
```bash
# Remove worktree
git worktree remove ../checked-out-issue-{issue_number}

# Delete local branch
git branch -d feature/issue-{issue_number}

# Delete remote branch (if pushed)
git push origin --delete feature/issue-{issue_number}
```

---

**Remember:** This command only creates the worktree. The user must manually open it in a new VS Code window and run the three-phase workflow there.
