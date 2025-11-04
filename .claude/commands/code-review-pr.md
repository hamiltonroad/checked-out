# Code Review PR

**Purpose:** Analyze PR diff against project standards for quality assurance

**Model:** Sonnet (invokes code-review-pr-agent)

**Usage:** `/code-review-pr [issue-number]`

**Prerequisites:**
- Implementation complete
- PR created or uncommitted changes exist

**Context:** Agent loads project standards in isolated context

**Next Step After This:** Fix any issues found, then merge PR

---

## WHAT THIS COMMAND DOES

1. ✅ Invoke code-review-pr-agent with issue number
2. ✅ Agent loads project standards from standards/ directory
3. ✅ Agent gets PR diff or uncommitted changes
4. ✅ Agent analyzes against project standards systematically
5. ✅ Agent categorizes findings: Critical/High/Medium/Low
6. ✅ Agent identifies code quality issues and best practice violations
7. ✅ Agent returns comprehensive summary with findings
8. ✅ Human fixes issues and merges PR

**This command does NOT:**
- ❌ Make code changes (human does that)
- ❌ Merge PR (human does that after fixes)
- ❌ Create retrospective files (simplified workflow)

---

## EXECUTION

### Step 1: Determine Issue Number

**If provided in command:**
```bash
/code-review-pr 268
```

**If not provided:**
- Extract from current branch name (e.g., `feature/issue-268-*`)
- Or prompt user: "What issue number is this PR for?"

### Step 2: Invoke Agent

**Launch code-review-pr-agent:**

```
Task tool → code-review-pr-agent

"Perform comprehensive code review for Issue #[NUMBER].

Please:
1. Load project standards from standards/full/ directory:
   - craftsmanship.md - Core craftsmanship principles
   - tech-stack.md - Technology stack standards
   - backend-standards.md (for backend changes) - Node.js/Express/Sequelize standards
   - frontend-standards.md (for frontend changes) - React/Vite/MUI standards
2. Get PR diff or uncommitted changes (try gh pr diff, then git diff HEAD, then git diff main...HEAD)
3. Analyze code systematically against project standards
4. Check for:
   - Code style violations (ESLint, Prettier compliance)
   - Architecture/pattern violations (3-tier architecture, MVC patterns)
   - Security issues (authentication, validation, SQL injection prevention)
   - Testing gaps (Jest/Vitest coverage)
   - Documentation gaps (JSDoc, comments)
   - Performance concerns (database queries, component renders)
5. Categorize findings: Critical/High/Medium/Low
6. Return comprehensive summary with:
   - All findings listed with severity and details
   - Specific file locations affected
   - Recommended fixes
   - Overall code quality assessment"
```

### Step 3: Display Agent Results

**Agent will return comprehensive summary:**

```
📊 **Code Review Complete for Issue #[NUMBER]**

**Standards analyzed:**
- ✅ craftsmanship.md
- ✅ tech-stack.md
- ✅ backend-standards.md (if backend changes)
- ✅ frontend-standards.md (if frontend changes)

**Findings Summary:**
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

[Detailed findings with file locations and recommendations...]

**Overall Assessment:** [Pass/Needs fixes]

**Next steps:** [see below]
```

### Step 4: Prompt Human for Next Action

**Display next steps clearly:**

```
✅ **Code Review Complete**

👤 **NEXT STEPS:**

**If Critical or High issues found:**
   - Review findings above
   - Fix the issues
   - Re-run tests if needed
   - Push changes
   - Optionally re-run `/code-review-pr` to verify fixes

**When all issues resolved:**
   - Approve PR in GitHub
   - Merge the PR (manually or via gh CLI)

**If no critical issues:**
   - Review any Medium/Low suggestions
   - Decide if changes needed before merge
   - Approve and merge when ready
```

---

## ERROR HANDLING

**Agent fails to complete:**
```
⚠️ Error: Agent did not complete code review.

**Possible causes:**
- Standards files missing
- No changes found to review
- Agent timeout or error

**Recovery:**
- Check agent error message
- Verify standards/ directory exists
- Verify PR exists or uncommitted changes present
- Retry agent invocation
```

**No issue number provided:**
```
❌ Error: Issue number required.

Usage: /code-review-pr [issue-number]

Example: /code-review-pr 268
```

**No changes found:**
```
❌ Error: No changes to review.

Agent checked:
- PR diff (no PR found)
- Uncommitted changes (working tree clean)
- Branch comparison (no commits on branch)

Please make changes or create PR before running `/code-review-pr`.
```

---

## NOTES

- Agent performs comprehensive review in isolated context
- Agent completes autonomously without interactive prompts
- Reviews code against project standards in standards/full/ directory
- Focus on code quality, best practices, and standards compliance
- Takes 5-15 minutes depending on PR size

---

**Related Commands:**
- `/plan-issue <number>` - Plan implementation approach
- `/prep-issue <number>` - Prepare for implementation
- `/implement-issue <number>` - Implement the feature/fix
