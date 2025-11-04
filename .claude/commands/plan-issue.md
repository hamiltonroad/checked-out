---
model: claude-opus-4-20250514
---

# Plan Issue (Phase 2: Planning)

**Purpose:** Deep planning with Opus - analyze issue, load full context (including test strategy), create comprehensive implementation plan with test location guidance.

**Model:** Opus (deep reasoning, better planning)

**Usage:** `/plan-issue <issue-number>`

**Prerequisites:** Must run `/prep-issue <issue-number>` first

**Next Steps:** After reviewing plan, run `/implement-issue <issue-number>` (uses Sonnet for execution)

**Example escalation:**
If test location unclear, plan will note "HUMAN DECISION NEEDED: Test location for [reason]" and wait for guidance.

---

## WHAT THIS COMMAND DOES

1. ✅ Read issue from `.claude/temp/GH-ISSUE-<number>-REMOVE.md`
2. ✅ Read context guess from `.claude/temp/CONTEXT-GUESS-<number>-REMOVE.md`
3. ✅ Load minimal project context (CLAUDE.md for database access patterns; strategic docs optional based on issue scope)
4. ✅ Analyze issue deeply - understand requirements, constraints, risks
5. ✅ Create detailed step-by-step implementation plan
6. ✅ Specify which agents to use (material-design-architect, playwright-qa-agent)
7. ✅ Suggest test file location based on issue type
8. ✅ Flag test location for human approval if unclear or edge case
9. ✅ Update context guess if needed (refine file list)
10. ✅ Output plan to `.claude/temp/PLAN-<number>-REMOVE.md`

**This command does NOT:**
- ❌ Execute the plan (that's `/implement-issue`)
- ❌ Write any code (that's `/implement-issue`)
- ❌ Make any changes to codebase (read-only analysis)

---

## EXECUTION STEPS

### Step 1: Validate Prerequisites

**Check required files exist:**
```bash
# Issue file must exist
ls .claude/temp/GH-ISSUE-<number>-REMOVE.md

# Context hint must exist
ls .claude/temp/CONTEXT-HINT-<number>-REMOVE.md
```

**If files missing:**
```
❌ Error: Required files not found.

Expected files:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md
- .claude/temp/CONTEXT-HINT-<number>-REMOVE.md

Please run: /prep-issue <number> first
```

**If files exist:**
- ✅ Continue to Step 2

### Step 2: Load Issue and Context Hint

**Read files:**
1. Read `.claude/temp/GH-ISSUE-<number>-REMOVE.md`
2. Read `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md`

**Extract key information:**
- Issue title, body, labels
- Keywords extracted from issue
- Files/paths mentioned in issue
- Suggested directories for exploration
- Related standards

### Step 3: Load Minimal Project Context (Default)

**IMPORTANT: Strategic context loading is now OPTIONAL to save tokens.**

**Always load (lightweight):**

1. `/Users/jmcrider/vscode/checked out/.claude/CLAUDE.md`
   - Essential guide for Claude sessions
   - Database access patterns
   - Testing requirements
   - **IMPORTANT:** How to query database and test implementations

2. `/Users/jmcrider/vscode/checked out/README.md`
   - Project overview and architecture
   - Tech stack summary
   - **IMPORTANT:** Understanding the 3-tier architecture

3. `/Users/jmcrider/vscode/checked out/standards/quick-ref/frontend-quick-ref.md`
   - React + Material UI patterns
   - Component structure and naming conventions
   - **IMPORTANT:** Ensures frontend code follows standards

4. `/Users/jmcrider/vscode/checked out/standards/quick-ref/backend-quick-ref.md`
   - Node.js + Express + MySQL/Sequelize patterns
   - Controller/Service separation
   - **IMPORTANT:** Ensures backend code follows standards

5. `/Users/jmcrider/vscode/checked out/standards/quick-ref/craftsmanship-quick-ref.md`
   - DRY, KISS, SOLID principles with examples
   - **IMPORTANT:** Ensures code quality

**Strategic context (ONLY load if issue requires):**

Load these ONLY if issue involves:
- **Full tech details** → Read `standards/full/tech-stack.md`
- **Detailed frontend standards** → Read `standards/full/frontend-standards.md`
- **Detailed backend standards** → Read `standards/full/backend-standards.md`
- **Architecture decisions** → Read full standards

**Decision criteria:**
- ✅ **90% of issues:** Use quick-refs only (bug fixes, features, refactoring)
- ✅ **10% of issues:** Load full standards for complex architectural decisions

**Examples when to load full standards:**
- Issue involves architectural decisions
- Issue requires understanding complete patterns
- Issue changes project structure significantly

**Examples when to skip (most issues):**
- Bug fixes → Quick-refs sufficient
- Feature implementation with clear specs → Quick-refs sufficient
- Code refactoring → Quick-refs sufficient
- UI enhancements → Quick-refs sufficient

**Token savings:** Quick-refs provide 60-75% reduction compared to full standards

### Step 4: Explore Context with context-fetcher Agent

**Use context-fetcher agent for token-efficient exploration:**

**Step 4.1: Review CONTEXT-HINT file**
- Read `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md` (already loaded in Step 2)
- Extract keywords and mentioned files
- Note suggested directories for exploration
- Identify related standards to reference

**Step 4.2: Use context-fetcher to explore files**

Instead of reading full files, use context-fetcher agent:

```
Task tool → context-fetcher

For high-confidence files:
- "What does [filename] do?" - Get file structure + key functions
- "Show me the structure of [filename]" - Get imports/exports without implementation

For directories:
- "Summarize the frontend/src/components/ directory"
- "Summarize the backend/src/controllers/ directory structure"

For specific functions/classes:
- "Find where [FunctionName] is implemented"
- "What does [ClassName].[methodName]() do?"

For dependencies:
- "Find all files that import [module]"
- "Find all files in [directory] that use [pattern]"
```

**Benefits of using context-fetcher:**
- Token savings: ~80-90% reduction vs reading full files
- Smart excerpts: 10-20 lines of relevant code with context
- File relationships: Shows imports, usage, dependencies
- Line numbers: Easy to reference specific code locations

**Step 4.3: Read standards/docs mentioned**
- Relevant standards (frontend, backend, craftsmanship)
- Quick references already loaded in Step 3
- Full standards only if architectural decisions needed

**Note:** Quick-refs are already token-optimized (~200-300 lines each)

### Step 5: Deep Analysis (Opus Reasoning)

**Understand the issue:**
- What is the actual problem or requirement?
- What are the acceptance criteria?
- What are the constraints?
- What could go wrong?

**Identify affected areas:**
- Which files need to be created/modified/deleted?
- Which standards apply?
- What human decisions are needed?

**Plan the implementation:**
- Break into logical phases
- Identify dependencies between tasks
- Estimate time for each task (30-minute chunks)
- Flag potential risks or blockers

**Consider quality gates:**
- What manual testing is needed?
- How to verify the changes work?
- What edge cases need consideration?

**Escalation protocol:**
- If issue is too complex or ambiguous after analysis: Stop and ask human for clarification
- If multiple valid approaches exist with unclear trade-offs: Present options to human
- If plan requires architectural decisions: Escalate to human
- After 3 failed attempts to create coherent plan: Request human guidance
- Don't waste time on unclear requirements - escalate proactively

### Step 6: Create Implementation Plan

**Output to:** `.claude/temp/PLAN-<number>-REMOVE.md`

**Plan format:**
```markdown
# Implementation Plan for Issue #<number>

**⚠️ TEMPORARY SESSION DOCUMENT - REMOVE AFTER SESSION**

This plan was created by Opus for Sonnet to execute. Remove when:
- [ ] Session is complete
- [ ] PR is merged
- [ ] Issue is closed

---

## Issue Summary

**Title:** <title>
**Description:** <brief summary>
**Labels:** <labels>
**Complexity:** <Low/Medium/High>
**Estimated Time:** <X hours>

---

## Analysis

**What needs to be done:**
<Clear explanation of requirements>

**Why this is needed:**
<Business/technical justification>

**Risks and concerns:**
- <Risk 1>
- <Risk 2>

**Human decisions needed:**
- <Decision 1>
- <Decision 2>

---

## Files to Modify

**Create:**
- `path/to/new-file.js` - Purpose: <description>

**Modify:**
- `path/to/existing.js` - Changes: <what to change>
- `path/to/script.sh` - Changes: <what to change>

**Delete (if applicable):**
- `path/to/obsolete.js` - Reason: <why removing>

**Read (for context):**
- `path/to/reference.md` - Reference: <what info to extract>

---

## Verification Strategy

**Manual testing:**
- [ ] List specific test scenarios
- [ ] Happy path validation
- [ ] Edge case verification
- [ ] Error handling confirmation

**Code quality:**
- [ ] ESLint passes (no warnings)
- [ ] Prettier formatted
- [ ] PropTypes defined (frontend)
- [ ] No console.log statements
- [ ] Standards compliance verified

**If verification approach unclear:** HUMAN DECISION NEEDED - [Explain why unclear and ask for guidance]

---

## Implementation Steps (30-min chunks)

### Phase 1: [Phase Name] (Estimated: X min)

**Task 1.1: [Task Name]** (30 min)
- **What:** <Clear description>
- **How:** <Step-by-step>
- **Files:** <Which files to touch>
- **Standards:** [CODING_QUICK, PRINCIPLES_QUICK, etc.]
- **Success criteria:** <How to know it's done>

**Task 1.2: [Task Name]** (20 min)
- **What:** <Clear description>
- **How:** <Step-by-step>
- **Success criteria:** <How to know it's done>

### Phase 2: [Phase Name] (Estimated: X min)

**Task 2.1: [Task Name]** (25 min)
- **What:** <Clear description>
- **How:** <Step-by-step>
- **Success criteria:** <How to know it's done>

### Phase 3: Testing & Verification (Estimated: X min)

**Task 3.1: Execute automated tests** (10 min)
- **What:** Run the actual implementation to verify it works
- **How:** Execute the seeder/feature/code and capture real output
- **Success criteria:** Implementation runs without errors, produces expected results

**Task 3.2: Create verification document with actual results** (15 min)
- **What:** Document for human validation with Claude's test results
- **File:** `.claude/temp/VERIFICATION-<number>-REMOVE.md`
- **Include:**
  - Changes made summary
  - **Actual test results from Claude's execution** (screenshots, output, data samples)
  - Additional adhoc testing steps for human
  - Expected results for human tests
- **Required:** Real evidence that Claude tested the implementation

**Task 3.3: Wait for human validation** (BLOCKING)
- **What:** Human reviews Claude's test results and performs additional testing
- **Human action required:**
  - Review Claude's test results
  - Perform additional adhoc testing
  - Verify changes work as expected
- **Next:** Human creates PR if satisfied

---

## Standards Compliance

**Standards to follow:**
- [backend-quick-ref] - For Node.js/Express/MySQL code
- [frontend-quick-ref] - For React/Material UI components
- [craftsmanship-quick-ref] - For code quality principles
- [tech-stack-quick-ref] - For technology choices

**Quick references location:**
`/Users/jmcrider/vscode/checked out/standards/quick-ref/`

---

## Human Tasks (Not Claude)

**Decision points:**
- [ ] Approve architectural changes (if applicable)
- [ ] Review implementation approach

**Quality gates:**
- [ ] Validate implementation manually (REQUIRED before commit)
- [ ] Review code quality
- [ ] Create PR and merge

---

## Manual Validation

**Verification steps:**
- <Step-by-step manual test procedures>
- <Expected results>
- <What to check in browser/database>

**Quality checks:**
- Run ESLint: `npm run lint`
- Run Prettier: `npm run format`
- Check console for errors
- Verify responsive design (if frontend)
- Test edge cases

---

## Verification Checklist

**Before marking issue complete:**
- [ ] All tasks completed (check TodoWrite)
- [ ] ESLint and Prettier passing
- [ ] Verification document created
- [ ] Human validated functionality
- [ ] No console errors or warnings
- [ ] PropTypes defined (if frontend)
- [ ] Responsive design verified (if UI changes)
- [ ] Code follows standards

---

## Potential Blockers

**Blocker 1:** <Description>
- **Impact:** <High/Medium/Low>
- **Mitigation:** <How to resolve>
- **Escalation:** <When to ask human>

**Blocker 2:** <Description>
- **Impact:** <High/Medium/Low>
- **Mitigation:** <How to resolve>

---

## Context Refinement

**Files explored beyond initial hint:**
- `path/to/additional.js` - Reason: <why explored>
- `path/to/another.js` - Reason: <discovery rationale>

**Note:** Context hint file is intentionally minimal (~150 tokens) and not updated. Opus uses context-fetcher for comprehensive exploration.

---

**Plan created:** <timestamp>
**Created by:** /plan-issue command (Opus)
**Estimated total time:** <X hours>
**Complexity rating:** <Low/Medium/High>

---

## Next Steps for Human

1. **Review this plan carefully**
   - Does it make sense?
   - Are there missing considerations?
   - Any concerns or questions?

2. **If plan looks good:**
   - Run `/implement-issue <number>` to execute (uses Sonnet)

3. **If plan needs changes:**
   - Provide feedback
   - Re-run `/plan-issue <number>` to regenerate

4. **Once implementation starts:**
   - Monitor TodoWrite progress
   - Be available for decision points
   - Validate when Claude requests (BLOCKING)
```

### Step 7: Update Context Guess (If Needed)

**If Opus discovered additional relevant files:**

Update `.claude/temp/CONTEXT-GUESS-<number>-REMOVE.md`:
- Add newly discovered files to appropriate confidence sections
- Remove files that turned out to be irrelevant
- Add note: "Updated by Opus during planning phase"

### Step 8: Output Summary

**Display to user:**
```markdown
✅ **Plan Issue #<number> Complete**

**Plan created:** `.claude/temp/PLAN-<number>-REMOVE.md`

**Summary:**
- **Complexity:** <Low/Medium/High>
- **Estimated time:** <X hours>
- **Files to modify:** <count>
- **Agents to use:** material-design-architect [Y/N], playwright-qa-agent [Y/N]
- **Human decisions needed:** <count>
- **Potential blockers:** <count>

**Plan highlights:**
- <Key point 1>
- <Key point 2>
- <Key point 3>

**Next steps:**
1. **Review plan:** Open `.claude/temp/PLAN-<number>-REMOVE.md`
2. **If plan looks good:** Run `/implement-issue <number>`
3. **If changes needed:** Provide feedback and re-run `/plan-issue <number>`

**Planning time:** <X> minutes (Opus deep reasoning)
```

---

## ERROR HANDLING

**Prep files missing:**
```
❌ Error: Prep files not found.

Required files:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md
- .claude/temp/CONTEXT-HINT-<number>-REMOVE.md

Please run: /prep-issue <number> first
```

**Cannot load project context:**
```
❌ Error: Cannot load required project context files.

Missing files:
- <file path>

Please ensure these files exist in the repository.
```

**Issue too complex to plan automatically:**
```
⚠️ Warning: This issue appears highly complex and may require human architectural decisions.

Complexity indicators:
- <Reason 1>
- <Reason 2>

Recommendation: Human should review issue and provide architectural guidance before planning.

Continue with automatic planning? (may be incomplete)
```

---

## NOTES

- This command uses Opus for deep reasoning
- Planning may take 2-5 minutes (much longer than prep-issue)
- Plan is comprehensive and detailed (Sonnet will execute mechanically)
- Human should review plan before running /implement-issue
- Plan can be regenerated if needed (re-run /plan-issue)
- Uses context-fetcher agent for token-efficient exploration (~80-90% savings vs reading full files)
- Context hint from prep-issue provides starting points (~150 tokens)

---

**Related Commands:**
- `/prep-issue <number>` - Previous step: Setup and context guess (Sonnet)
- `/implement-issue <number>` - Next step: Execute plan (Sonnet)
- `/session-start` - DEPRECATED: Use three-phase workflow instead
