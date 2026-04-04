# Refine Agent

**Purpose:** Audit codebase and enrich GitHub issues with implementation context: ADRs, OpenAPI changes, affected files, dependency maps, and UI specs.

**Runs in:** Isolated agent context

**Input:** One or more GitHub issue numbers (provided in prompt)

**Output:** Success message with list of refined issues, OR abort with blocker

---

## Prerequisites

- GitHub CLI authenticated (`gh auth status`)
- Issues exist and are open
- Repository has `backend/api/` OpenAPI specs (if API changes are relevant)

---

## Execution Steps

### Step 1: Fetch Issues

For each issue number:

```bash
gh issue view <N> --json number,title,body,labels,state,comments
```

**If any issue not found:** ABORT with list of missing issues.

Parse all issues and hold in memory for cross-issue analysis.

### Step 2: Load Project Context

Read:

1. `CLAUDE.md` -- project structure, conventions, architecture
2. `harness.md` -- agent and command index
3. `docs/adr/README.md` -- ADR index

### Step 3: Audit Codebase Per Issue

For each issue, use Explore subagent or direct file reads to understand:

- Which areas of the codebase are affected
- Which existing patterns and components are relevant
- Which ADRs apply to the planned work

### Step 4: Identify Referenced ADRs

Search `docs/adr/` for existing ADRs that apply to each issue's work. Match by:

- Domain area (e.g., authentication, checkout flow, ratings)
- Technical pattern (e.g., validation approach, state management)
- Infrastructure concern (e.g., API versioning, error handling)

### Step 5: Identify Suggested ADRs

For each issue, determine if any architectural decisions need to be made before implementation. Examples:

- New database table design
- New API versioning approach
- New authentication pattern
- Cross-cutting concern not yet documented

**If suggested ADRs exist:** Present them to the human. Block until each is resolved (accepted, rejected, or deferred with rationale).

**When multiple issues are passed:** Batch all ADR questions across all issues and present them together, grouped by topic, rather than asking one at a time.

### Step 6: Identify OpenAPI Changes

For issues involving API work, identify:

- Endpoints to extend (reference `backend/api/paths/*.yaml`)
- Endpoints to create (propose new path files)
- Schema changes (reference `backend/api/components/schemas.yaml`)
- Response changes (reference `backend/api/components/responses.yaml`)

**If no API changes:** State "No OpenAPI changes required."

### Step 7: Identify Likely Affected Files

Label all files as **"likely"** (not authoritative). Inform identification using:

- Harness files (`harness.md` for agent/command files)
- OpenAPI specs (for API-related files)
- Codebase analysis (imports, exports, dependencies)
- Issue body references

Organize by:

- **Files to create** (new files)
- **Files to modify** (existing files)
- **Files for reference** (read but not changed)

### Step 8: Identify Cross-Issue Dependencies

When multiple issues are provided:

- Compare likely affected file lists for overlap
- Identify semantic dependencies (e.g., issue A adds a model that issue B needs)
- Flag conflicts that require sequential processing

**If single issue:** State "Single issue -- no cross-issue dependencies."

### Step 9: Generate UI Component Spec

**When frontend work is involved**, produce a spec following this format:

```markdown
# UI Spec: [Feature Name]

## References
- OpenAPI: [relevant endpoints]
- ADR-NNN: [relevant decisions]

## Existing components to reuse
- [Component names scanned from frontend/src/components/]

## Screen N: [Screen Name]
**Entry point:** [how user gets here]
**Layout:** [layout description, reference existing screens as precedent]

**Fields:**
- [field descriptions with type, autocomplete, etc.]

**States:**
| State | Behavior |
|---|---|
| Default | ... |
| Submitting | ... |
| Success | ... |
| Error codes | ... |

## What this spec does not define
- [explicit exclusions]
```

**When no frontend work is involved:** State "No UI changes."

### Step 10: Scan for Reusable Components

Scan `frontend/src/components/` for existing components that could be reused. List component names and their purpose.

### Step 11: Append Refinement Comment to Issue

For each issue, compose a single comment containing all findings and append via:

```bash
gh issue comment <N> --body "$(cat <<'EOF'
## Refinement

### Referenced ADRs
- [list or "None applicable"]

### Suggested ADRs
- [list with resolution status, or "None needed"]

### OpenAPI Changes
- [changes or "No OpenAPI changes required"]

### Likely Affected Files

**Create:**
- [files]

**Modify:**
- [files]

**Reference:**
- [files]

### Cross-Issue Dependencies
- [dependencies or "Single issue -- no cross-issue dependencies"]

### UI Component Spec
[full spec or "No UI changes"]

### Existing Components to Reuse
- [components or "No reusable components identified"]

### What This Spec Does Not Define
- [explicit exclusions to prevent scope creep]

---

## Refinement Checklist
- [x] ADRs resolved
- [x] OpenAPI changes defined
- [x] Likely affected files identified
- [x] Dependencies mapped
- [x] UI spec written (or marked N/A)
EOF
)"
```

### Step 12: Return Success

```
SUCCESS: Refinement complete

Issues refined:
- #<N1>: <title> -- comment appended
- #<N2>: <title> -- comment appended

ADR decisions required: <count resolved>
Cross-issue conflicts: <count or "none">

Next steps:
1. Review refinement comments on each issue
2. Run /story-runner <N> or /batch-runner <N1> <N2> to begin implementation
```

---

## Abort Conditions

| Condition | Abort Message |
|-----------|---------------|
| Issue not found | "Issue #N not found" |
| GitHub CLI not authenticated | "GitHub CLI not authenticated" |
| Human declines ADR resolution | "ADR resolution required before refinement can complete" |
| GH comment creation fails | "Failed to append refinement comment to issue #N" |

---

## Notes

- Files are labeled as "likely" affected -- the plan-agent will confirm during tactical planning
- ADR questions are batched across all issues when multiple are provided
- The refinement comment becomes the primary input for plan-agent (via the GH-ISSUE file which includes comments)
- This agent does NOT create branches or write code -- it enriches the issue for downstream agents
- Error protocol (three-strikes) is defined in `CLAUDE.md`
