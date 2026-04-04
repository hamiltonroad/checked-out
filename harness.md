# Harness Infrastructure Index

Authoritative index of all harness files that support agent workflows, standards enforcement, and project governance. Agents should consult this file to discover which documents are relevant to their current task.

**Convention:** Files ending in `-kit` are imported from an external project and are **read-only**. They must not be modified, deleted, or consolidated. Project-owned files may customize behavior defined in their `-kit` counterparts.

---

## Agent Definitions (`.claude/agents/`)

| File | Purpose | Consult when... |
|------|---------|-----------------|
| `prep-agent.md` | Fetches and formats GitHub issue data | Running prep stage of a story |
| `plan-agent.md` | Creates implementation plans from issue data | Running plan stage of a story |
| `implement-agent.md` | Executes plans, tests, commits, and creates PRs | Running implement stage of a story |
| `prep-kit.md` *(kit)* | External template for prep agent | Comparing project prep-agent to upstream |
| `plan-kit.md` *(kit)* | External template for plan agent | Comparing project plan-agent to upstream |
| `implement-kit.md` *(kit)* | External template for implement agent | Comparing project implement-agent to upstream |
| `batch-worker-kit.md` *(kit)* | Worker agent for batch processing | Running batch workflows |
| `code-review-kit.md` *(kit)* | Agent for automated code review | Running code review workflows |
| `swarm-worker-kit.md` *(kit)* | Worker agent for swarm-style parallel tasks | Running swarm workflows |

## Slash Commands (`.claude/commands/`)

| File | Purpose | Consult when... |
|------|---------|-----------------|
| `story-runner.md` | Orchestrates prep -> plan -> implement for one issue | Using `/story-runner <number>` |
| `batch-runner.md` | Orchestrates multiple issues in sequence | Using `/batch-runner` |
| `resolve-smoke-failure.md` | Diagnoses and fixes smoke test failures | Smoke tests fail during implementation |
| `EXAMPLE-VERIFICATION-FORMAT.md` | Template for verification documents | Creating verification docs |
| `story-runner-kit.md` *(kit)* | External template for story-runner | Comparing to upstream |
| `batch-runner-kit.md` *(kit)* | External template for batch-runner | Comparing to upstream |
| `code-review-pr-kit.md` *(kit)* | Command for PR code review | Running `/code-review-pr` |
| `harvest-reviews-kit.md` *(kit)* | Command to harvest review findings | Running `/harvest-reviews` |
| `implement-issue-kit.md` *(kit)* | Command to implement a single issue | Running `/implement-issue` |
| `integrate-kit.md` *(kit)* | Command to integrate branches | Running `/integrate` |
| `plan-issue-kit.md` *(kit)* | Command to plan a single issue | Running `/plan-issue` |
| `prep-issue-kit.md` *(kit)* | Command to prep a single issue | Running `/prep-issue` |
| `start-worktree-kit.md` *(kit)* | Command to start a git worktree | Running `/start-worktree` |

## Knowledge Base (`knowledge/`)

All knowledge files are **read-only kit imports**.

| File | Purpose | Consult when... |
|------|---------|-----------------|
| `agent-operations-kit.md` *(kit)* | Agent lifecycle, error handling, reporting | Building or debugging agent workflows |
| `architecture-kit.md` *(kit)* | Harness architecture overview | Understanding how harness components connect |
| `audit-checklist-kit.md` *(kit)* | Checklist for auditing harness completeness | Auditing harness setup |
| `claude-md-kit.md` *(kit)* | Guide to writing CLAUDE.md files | Editing CLAUDE.md |
| `claude-md-sample-kit.md` *(kit)* | Sample CLAUDE.md for reference | Creating new CLAUDE.md files |
| `concepts-kit.md` *(kit)* | Core harness concepts and terminology | Onboarding to the harness |
| `context-management-kit.md` *(kit)* | Context compaction and persistence patterns | Managing agent context windows |
| `hooks-kit.md` *(kit)* | Git hook patterns for harness | Setting up git hooks |
| `sample-files-kit.md` *(kit)* | Sample file templates | Creating new harness files |
| `subagents-kit.md` *(kit)* | Sub-agent scoping and delegation patterns | Spawning or configuring sub-agents |
| `tools-and-trust-kit.md` *(kit)* | Tool permissions and trust model | Configuring agent tool access |

## Standards: Quick Reference (`standards/quick-ref/`)

| File | Purpose | Consult when... |
|------|---------|-----------------|
| `backend-quick-ref.md` | Backend coding patterns and conventions | Writing backend code |
| `frontend-quick-ref.md` | Frontend coding patterns and conventions | Writing frontend code |
| `craftsmanship-quick-ref.md` | Code quality principles (SOLID, etc.) | Reviewing code quality |
| `database-guide.md` | Database schema and migration patterns | Working with database |
| `enterprise-patterns-quick-ref.md` | Enterprise patterns (validation, audit, etc.) | Implementing business logic |
| `tech-stack-quick-ref.md` | Technology stack reference | Choosing libraries or patterns |
| `testing-guide.md` | Testing strategy and patterns | Writing or reviewing tests |
| `craftsmanship-kit.md` *(kit)* | External craftsmanship reference | Comparing to upstream |
| `harness-standard-kit.md` *(kit)* | Harness file standards | Creating new harness files |

## Standards: Full (`standards/full/`)

Detailed versions of the quick-ref guides. Consult when the quick-ref lacks sufficient detail.

| File | Purpose |
|------|---------|
| `backend-standards.md` | Full backend standards |
| `frontend-standards.md` | Full frontend standards |
| `craftsmanship.md` | Full craftsmanship standards |
| `tech-stack.md` | Full tech stack reference |
| `harness-standard-kit.md` *(kit)* | Full harness file standards |

## Standards: Other (`standards/`)

| File | Purpose | Consult when... |
|------|---------|-----------------|
| `code-review.md` | Code review checklist and process | Performing code reviews |
| `issue-authoring-guide-kit.md` *(kit)* | Guide for writing GitHub issues | Authoring new issues |

## ADRs (`docs/adr/`)

Architecture Decision Records document design choices. **38 files** including a `README.md` index. Consult `docs/adr/README.md` for the full list. Review relevant ADRs when making architectural decisions or understanding why something was built a certain way.

## Code Review Results (`code-review-results/`)

Post-review findings organized by issue. **13 active files** plus an `archive/` directory with 23 historical reviews and a `metrics.csv` for tracking. Consult when reviewing past code review feedback for a specific issue.

## Harness Config (`.claude/`)

| File | Purpose | Consult when... |
|------|---------|-----------------|
| `settings.json` | Shared Claude Code settings (checked in) | Configuring agent permissions |
| `settings.local.json` | Local overrides (not checked in) | Customizing local agent behavior |

---

## API Specification (`backend/api/`)

| File | Purpose | Consult when... |
|------|---------|-----------------|
| `openapi.yaml` | OpenAPI 3.1.0 spec — machine-readable contract for all REST endpoints | Building API clients, validating endpoints, reviewing API surface, generating documentation |

---

## File Relationships

- **Quick-ref** files summarize their **full** counterparts in `standards/full/`.
- **Agent definitions** (`.claude/agents/`) are invoked by **slash commands** (`.claude/commands/`).
- **Slash commands** orchestrate agents in workflows: `story-runner` calls `prep-agent` -> `plan-agent` -> `implement-agent`.
- **Knowledge files** provide deep-dive reference material that agents consult as needed.
- **Kit files** are external imports from the harness template project. **Non-kit files** with similar names are project-specific customizations (e.g., `prep-agent.md` customizes `prep-kit.md`).
- **Code review results** are produced by review workflows and feed back into future implementation decisions.

## Kit vs Project-Owned File Pairs

| Project file | Kit counterpart | How they differ |
|-------------|-----------------|-----------------|
| `agents/prep-agent.md` | `agents/prep-kit.md` | Project version customized for Checked Out workflow |
| `agents/plan-agent.md` | `agents/plan-kit.md` | Project version adds enterprise patterns analysis |
| `agents/implement-agent.md` | `agents/implement-kit.md` | Project version adds smoke test gates |
| `commands/story-runner.md` | `commands/story-runner-kit.md` | Project version adds smoke test gates |
| `commands/batch-runner.md` | `commands/batch-runner-kit.md` | Project version adds smoke test gates |
| `quick-ref/craftsmanship-quick-ref.md` | `quick-ref/craftsmanship-kit.md` | Project version is longer with SOLID code examples |

Kit-only files (no project counterpart) are used directly as-is.
