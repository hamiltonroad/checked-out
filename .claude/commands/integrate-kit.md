# Integrate Harness Kit

**Purpose:** Assess a project's current harness state, identify gaps, and guide the user through adopting harness-kit conventions — whether starting from scratch or strengthening an existing setup.

**Usage:** `/integrate-kit` or `/integrate-kit --dry-run`

---

## WHAT THIS COMMAND DOES

1. Assesses the project's current harness state (greenfield, weak brownfield, or strong brownfield)
2. Checks each harness component for existence and quality
3. Presents findings with gap analysis
4. For each gap, proposes a fix and asks the user whether Claude should handle it or they will do it manually

**This command does NOT:**

- Overwrite existing files without explicit user approval
- Assume any tech stack — it asks or infers from what exists
- Make changes by default — it assesses first, then proposes

---

## EXECUTION

### Step 0: Check for Dry-Run Mode

If `$ARGUMENTS` contains `--dry-run`, run the entire assessment but do not create or modify any files. Print what WOULD be done.

Announce mode at the start:

```
DRY RUN MODE — assessment only, no files will be created or modified.
```

If not dry-run:

```
HARNESS INTEGRATION — assess, propose, act (with your approval).
```

### Step 1: Classify Project State

Check the following and classify the project:

| Check | How |
| --- | --- |
| Git repo initialized? | Look for `.git/` directory |
| `CLAUDE.md` exists? | Check project root |
| `.claude/settings.json` exists? | Check path |
| `.claude/commands/` has files? | List directory |
| `.claude/agents/` has files? | List directory |
| `standards/` directory exists? | Check path |
| `code-review-results/` directory exists? | Check path |
| `.gitignore` exists? | Check project root |

**Classification:**

- **Greenfield** — No `CLAUDE.md`, no `.claude/` directory, possibly no git repo
- **Brownfield (weak harness)** — `CLAUDE.md` exists but is incomplete (missing canonical sections), no hooks, no standards
- **Brownfield (strong harness)** — `CLAUDE.md` with most sections, `.claude/settings.json` with hooks, some standards in place

Report the classification:

```
PROJECT STATE: [Greenfield | Brownfield (weak harness) | Brownfield (strong harness)]

Found:
- [x] Git repo initialized
- [ ] CLAUDE.md
- [x] .claude/settings.json (no hooks configured)
- [ ] standards/code-review.md
...
```

### Step 2: Assess CLAUDE.md

**If CLAUDE.md does not exist:**

```
GAP: CLAUDE.md does not exist
IMPACT: Agents have no project context — they will guess at stack, conventions, and constraints
FIX: Create CLAUDE.md from harness-kit sample template (knowledge/sample-files-kit.md)
ACTION: Let Claude handle this? (y/n)
```

If the user says yes, ask them to describe their tech stack, architecture, and key conventions. Then generate a CLAUDE.md following the six canonical sections from `knowledge/claude-md-kit.md`, keeping it under 60 lines.

**If CLAUDE.md exists:** Read it and check for the six canonical sections:

1. **Tech Stack** — project description, language, framework, key tools
2. **Architecture** — structural rules, layer boundaries, dependency flow
3. **Commands** — exact build, test, lint, run commands
4. **Constraints** — prohibitions and things NOT to do
5. **Conventions** — naming, style, patterns the linter does not catch
6. **Context Guidance** — pointers to where things are, session guidance

Section matching should be flexible — look for canonical names and common synonyms:
- Tech Stack: "Overview", "Stack", "About"
- Architecture: "Structure", "Project Structure", "Layout"
- Commands: "Build & Test", "Development", "Scripts"
- Constraints: "Do NOT", "Rules", "Prohibitions"
- Conventions: "Style", "Patterns", "Code Style"
- Context Guidance: "Context", "References", "Where Things Are"

Report per section:

```
CLAUDE.md ANALYSIS (N lines):

| Section | Status | Notes |
| --- | --- | --- |
| Tech Stack | Present | Clear, describes stack well |
| Architecture | Missing | No structural rules found |
| Commands | Present | Has build/test but missing lint command |
| Constraints | Weak | Only 1 prohibition — should have 3-5 minimum |
| Conventions | Present | Good coverage |
| Context Guidance | Missing | No pointers to related docs |
```

For each missing or weak section, present a GAP entry:

```
GAP: CLAUDE.md missing Architecture section
IMPACT: Agent has no structural rules — may put code in wrong layers or create circular dependencies
FIX: Add Architecture section with layer rules and dependency flow
ACTION: Let Claude handle this? (y/n)
```

If the user says yes for any CLAUDE.md changes, draft the additions and show them for approval before writing.

**Line count warning:** If CLAUDE.md exceeds 80 lines, note it. If over 100, recommend moving content to referenced files.

### Step 3: Assess .claude/settings.json

**If it does not exist:**

```
GAP: .claude/settings.json does not exist
IMPACT: No permission scoping, no hooks — agent can run any command and writes are not validated
FIX: Create .claude/settings.json with permissions and recommended hooks
ACTION: Let Claude handle this? (y/n)
```

If the user says yes, generate a settings file based on the project's tech stack (detected from CLAUDE.md, package.json, pyproject.toml, Cargo.toml, go.mod, or similar). Use `knowledge/sample-files-kit.md` as a reference for structure.

**If it exists:** Check for:
- `permissions.allow` — are common safe commands listed?
- `permissions.deny` — are destructive commands blocked?
- `hooks.PreToolUse` — any pre-write guards?
- `hooks.PostToolUse` — any post-write validators (lint, type check, secret scan)?

Report what is present and what is missing.

### Step 4: Assess .gitignore

Check if `.gitignore` exists and whether it contains these kit-specific entries:

```
.claude/temp/
.harness-kit.lock
code-review-results/
```

**If .gitignore does not exist:**

```
GAP: .gitignore does not exist
IMPACT: Temp files, lock files, and review results may be committed to the repo
FIX: Create .gitignore with kit entries (and standard entries for detected stack)
ACTION: Let Claude handle this? (y/n)
```

**If .gitignore exists but missing kit entries:**

```
GAP: .gitignore missing harness-kit entries
IMPACT: Temp files and review results may be committed to the repo
FIX: Append kit entries to .gitignore (idempotent, with marker comment)
ACTION: Let Claude handle this? (y/n)
```

If the user says yes, append idempotently using a marker:

```
# --- harness-kit ---
.claude/temp/
.harness-kit.lock
code-review-results/
# --- /harness-kit ---
```

Before appending, check if the marker already exists. If it does, skip.

### Step 5: Assess Standards and Review Infrastructure

**Check for `standards/code-review.md`:**

If it does not exist:

```
GAP: standards/code-review.md does not exist
IMPACT: Code reviews have no standard to evaluate against — /code-review-pr-kit will lack project-specific criteria
FIX: Create a skeleton code-review.md for the team to customize
ACTION: Let Claude handle this? (y/n)
```

If the user says yes, create a skeleton with sections for: Scope, Severity Levels, Evaluation Criteria (Architecture, Code Quality, Testing, Documentation), and a note to customize.

**Check for `code-review-results/` directory:**

If it does not exist:

```
GAP: code-review-results/ directory does not exist
IMPACT: /code-review-pr-kit and /harvest-reviews-kit have no output directory
FIX: Create code-review-results/ directory
ACTION: Let Claude handle this? (y/n)
```

**Check for `.claude/temp/` directory:**

If it does not exist:

```
GAP: .claude/temp/ directory does not exist
IMPACT: Agents have no scratch space for temporary files (issue context, plans, etc.)
FIX: Create .claude/temp/ directory
ACTION: Let Claude handle this? (y/n)
```

### Step 6: Assess Tooling and Environment

**GitHub CLI:**

Run `gh auth status` to check if the GitHub CLI is authenticated.

If not authenticated:

```
GAP: GitHub CLI not authenticated
IMPACT: Issue fetching, PR creation, and label management will not work
FIX: Run `gh auth login` (user must do this manually)
ACTION: Manual — run `gh auth login` to authenticate
```

**Git repo:**

If `.git/` does not exist:

```
GAP: Git repository not initialized
IMPACT: Branch management, commits, and PR workflows will not work
FIX: Run `git init` and set up remote
ACTION: Let Claude handle `git init`? (y/n) (Remote setup is manual)
```

### Step 6.5: Assess ADRs and OpenAPI Spec

The kit treats ADRs as universal and OpenAPI as the source of truth for HTTP APIs.

**ADR check:**

Look at CLAUDE.md's Context Guidance section for a reference to an ADR directory or ADR index (e.g., `docs/adr/README.md`). Also check common locations (`docs/adr/`, `docs/architecture/`, `adr/`) for a README index.

If no ADR reference exists and no ADR directory is found:

```
GAP: No ADR system found
IMPACT: Architectural decisions are undocumented — future agents and humans will re-litigate the same choices, and the refine-kit agent cannot enrich issues with referenced ADRs
FIX: Create `docs/adr/` with a `README.md` index. Add a reference to CLAUDE.md's Context Guidance.
ACTION: Let Claude handle this? (y/n)
```

If the user says yes, create `docs/adr/README.md` with a minimal index skeleton and update CLAUDE.md's Context Guidance to reference it.

**OpenAPI check:**

First determine whether the project exposes an HTTP API. Look for:
- HTTP framework dependencies in `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml` (express, fastify, koa, fastapi, flask, gin, actix, axum, etc.)
- Route/controller directories (`routes/`, `controllers/`, `handlers/`, `api/`)
- Existing OpenAPI/Swagger files (`openapi.yaml`, `openapi.json`, `swagger.yaml`)

If the project **has an HTTP API** but no OpenAPI spec is referenced in CLAUDE.md and no spec file is found:

```
GAP: Project exposes an HTTP API but has no OpenAPI specification
IMPACT: The API has no source of truth — agents cannot verify endpoint contracts, schemas drift silently, and refine-kit cannot enrich issues with OpenAPI changes
FIX: Create an OpenAPI spec (root `openapi.yaml` is simplest; split into `paths/` and `components/` when it grows). Add a reference to CLAUDE.md's Context Guidance. The kit requires the spec to be updated before or alongside any API code change.
ACTION: Let Claude scaffold a minimal openapi.yaml? (y/n)
```

If the project has **no HTTP API** (CLI tool, library, batch job), skip this check and note: "No HTTP API detected — OpenAPI not applicable."

If the project has an OpenAPI spec but CLAUDE.md does not reference it:

```
GAP: OpenAPI spec exists but is not referenced in CLAUDE.md Context Guidance
IMPACT: Agents will not discover the spec and may bypass it when making API changes
FIX: Add a Context Guidance entry pointing to the spec file
ACTION: Let Claude handle this? (y/n)
```

### Step 7: Assess Kit File References in CLAUDE.md

**If CLAUDE.md exists and kit files have been synced to the project** (check for files with `-kit` in `.claude/agents/`, `.claude/commands/`, `knowledge/`, `standards/`):

Verify that CLAUDE.md's Context Guidance section references the synced kit directories so agents can find them. Check for references to:

- `knowledge/` — kit knowledge docs (agent operations, hooks, context management, etc.)
- `standards/` — craftsmanship standards, harness standard
- `.claude/agents/` — agent definitions
- `standards/quick-ref/craftsmanship-kit.md` — code style principles
- `knowledge/agent-operations-kit.md` — error protocol, model assignments

If kit files exist in the project but CLAUDE.md does not reference them:

```
GAP: CLAUDE.md does not reference synced kit files
IMPACT: Agents cannot find kit knowledge docs, standards, or agent definitions — the synced files are invisible
FIX: Add Context Guidance entries pointing to kit directories and key files
ACTION: Let Claude handle this? (y/n)
```

If the user says yes, add entries to the Context Guidance section following the pattern in `knowledge/claude-md-sample-kit.md`. Do not list every kit file — reference directories and call out the most important individual files.

### Step 8: Assess Existing Commands and Agents

List any files in `.claude/commands/` and `.claude/agents/`.

If they exist, report them — they may be custom commands the team already uses. Do not suggest removing them.

If they do not exist, note that harness-kit commands (like `/story-runner-kit`, `/code-review-pr-kit`, `/harvest-reviews-kit`) are available from the kit and can be referenced or copied.

```
EXISTING COMMANDS: None found
NOTE: harness-kit provides commands for story running, code review, and review harvesting.
      These work via the kit — no need to copy them into your project.
```

### Step 9: Summary and Action Plan

Present a final summary table:

```
INTEGRATION SUMMARY

| Component | Status | Action |
| --- | --- | --- |
| Git repo | Ready | — |
| CLAUDE.md | Missing | Create from template |
| .claude/settings.json | Missing | Create with hooks |
| .gitignore | Partial | Append kit entries |
| standards/code-review.md | Missing | Create skeleton |
| code-review-results/ | Missing | Create directory |
| .claude/temp/ | Missing | Create directory |
| ADR system | Missing | Create docs/adr/ with README index |
| OpenAPI spec | Missing (HTTP API detected) | Scaffold openapi.yaml |
| GitHub CLI | Authenticated | — |
| Existing commands | None | Kit commands available |

Ready to proceed with approved actions.
```

Then execute only the actions the user approved. After each action, confirm what was done.

### Step 10: Post-Integration Verification

After all approved actions are complete, do a quick re-check:

```
POST-INTEGRATION CHECK

- [x] CLAUDE.md exists and has N/6 canonical sections
- [x] .claude/settings.json exists with permissions and hooks
- [x] .gitignore has kit entries
- [x] standards/code-review.md exists
- [x] code-review-results/ directory exists
- [x] .claude/temp/ directory exists
- [x] ADR directory exists and is referenced in CLAUDE.md
- [x] OpenAPI spec exists and is referenced in CLAUDE.md (or N/A for non-HTTP projects)
- [x] Git repo initialized
- [x] GitHub CLI authenticated

Harness integration complete.
```

If any items were deferred by the user, list them as follow-up tasks:

```
DEFERRED (handle manually):
1. Add Architecture section to CLAUDE.md
2. Configure GitHub CLI authentication
```

---

## ERROR HANDLING

- **Cannot determine tech stack:** Ask the user directly rather than guessing
- **File write permission denied:** Report the error and suggest the user fix permissions
- **Existing file conflicts:** Never overwrite — show a diff of proposed changes and ask for approval
- **Partial completion:** Report what was done and what remains, so the user can re-run or finish manually

---

## NOTES

- This command is safe to run multiple times — it is idempotent and will skip components that are already in place
- The six canonical CLAUDE.md sections are defined in `knowledge/claude-md-kit.md`
- Sample files for reference are in `knowledge/sample-files-kit.md`
- The `--dry-run` flag is recommended for first use to preview the assessment without changes
- This command works on any tech stack — it detects the stack from existing config files and asks the user when uncertain
