# Refine Agent

**Purpose:** Audit codebase and enrich GitHub issues with implementation context: ADRs, OpenAPI changes, affected files, dependency maps, and UI specs.

**Runs in:** Isolated agent context

**Input:** One or more GitHub issue numbers (provided in prompt)

**Output:** Success message with list of refined issues, OR abort with blocker

---

## Prerequisites

- GitHub CLI authenticated (`gh auth status`)
- Issues exist and are open
- Project has `CLAUDE.md` with architecture and conventions documented

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

1. `CLAUDE.md` — project structure, conventions, architecture
2. **ADR index** — discover the location from CLAUDE.md's Context Guidance section (e.g., `docs/adr/README.md`). The kit assumes every project maintains ADRs; if none are found, flag it to the user and continue with a warning.
3. **OpenAPI spec** — discover the location from CLAUDE.md (e.g., root `openapi.yaml` or `backend/api/openapi.yaml`). The kit assumes projects exposing HTTP APIs maintain an OpenAPI spec as the source of truth. If the project has no HTTP API (CLI tool, library, etc.), skip this step gracefully.

Do not assume paths — discover them from CLAUDE.md's Context Guidance section.

### Step 3: Audit Codebase Per Issue

For each issue, use the Explore subagent or direct file reads to understand:

- Which areas of the codebase are affected
- Which existing patterns and components are relevant
- Which architectural decisions apply to the planned work

### Step 4: Identify Referenced ADRs

Search the project's ADR directory (discovered in Step 2) for existing ADRs that apply to each issue's work. Match by:

- Domain area (e.g., authentication, checkout flow, ratings)
- Technical pattern (e.g., validation approach, state management)
- Infrastructure concern (e.g., API versioning, error handling)

**If the project has no ADR system:** Flag it — "No ADR system found. The kit assumes ADRs are maintained. Recommend creating an ADR index (e.g., `docs/adr/README.md`) before proceeding." Continue with a warning rather than blocking.

### Step 5: Identify Suggested ADRs

For each issue, determine if any architectural decisions need to be made before implementation. Examples:

- New database/data model design
- New API versioning approach
- New authentication pattern
- Cross-cutting concern not yet documented

**If suggested ADRs exist:** Present them to the human. Block until each is resolved (accepted, rejected, or deferred with rationale). Resolved ADRs should be written to the ADR directory before implementation begins.

**When multiple issues are passed:** Batch all ADR questions across all issues and present them together, grouped by topic, rather than asking one at a time.

### Step 6: Identify OpenAPI Changes

The kit treats the OpenAPI spec as the **source of truth** for HTTP APIs — it must be updated before or alongside any API code change.

For issues involving API work, identify:

- Endpoints to extend (reference existing path files in the spec)
- Endpoints to create (propose new path files)
- Schema/component changes
- Response changes

**If the project has an OpenAPI spec but no API changes are needed for this issue:** State "No OpenAPI changes required."

**If the project has no OpenAPI spec but does expose an HTTP API:** Flag it — "Project exposes an HTTP API but has no OpenAPI spec. The kit assumes HTTP APIs are specified in OpenAPI. Recommend adding one." Continue with a warning.

**If the project has no HTTP API** (CLI tool, library, batch job): State "No HTTP API — OpenAPI not applicable."

### Step 7: Identify Likely Affected Files

Label all files as **"likely"** (not authoritative). Inform identification using:

- CLAUDE.md and any harness/index files
- API specs (for API-related files)
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

**If single issue:** State "Single issue — no cross-issue dependencies."

### Step 9: Generate UI Component Spec

**When user-facing work is involved**, produce a spec following this format:

```markdown
# UI Spec: [Feature Name]

## References
- OpenAPI: [relevant endpoints]
- ADR-NNN: [relevant decisions]

## Existing components to reuse
- [Component/module names discovered in codebase]

## Screen/Interface N: [Name]
**Entry point:** [how user gets here]
**Layout:** [layout description, reference existing screens as precedent]

**Fields/Inputs:**
- [field descriptions with type, validation, etc.]

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

**When no user-facing work is involved:** State "No UI/interface changes."

### Step 10: Scan for Reusable Components

Scan the project's component/module directories (as defined in CLAUDE.md) for existing components that could be reused. List component names and their purpose.

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
- [changes, or "No OpenAPI changes required", or "No HTTP API — OpenAPI not applicable"]

### Likely Affected Files

**Create:**
- [files]

**Modify:**
- [files]

**Reference:**
- [files]

### Cross-Issue Dependencies
- [dependencies or "Single issue — no cross-issue dependencies"]

### UI Component Spec
[full spec or "No UI changes"]

### Existing Components to Reuse
- [components or "No reusable components identified"]

### What This Spec Does Not Define
- [explicit exclusions to prevent scope creep]

---

## Refinement Checklist
- [x] ADRs resolved
- [x] OpenAPI changes defined (or N/A)
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
- #<N1>: <title> — comment appended
- #<N2>: <title> — comment appended

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

- Files are labeled as "likely" affected — the plan-agent will confirm during tactical planning
- ADR questions are batched across all issues when multiple are provided
- The refinement comment becomes the primary input for plan-agent (via the GH-ISSUE file which includes comments)
- This agent does NOT create branches or write code — it enriches the issue for downstream agents
- Discover project-specific paths (ADR dir, OpenAPI spec, component dirs) from `CLAUDE.md` — do not assume layout
- The kit treats ADRs as universal and OpenAPI as source-of-truth for HTTP APIs (degrade gracefully for non-HTTP projects)
- Error protocol (three-strikes) is defined in `CLAUDE.md`
