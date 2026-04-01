# Harness Maturity Standard

Four tiers describe how well a project's structured environment supports AI agents. Each tier builds on the one below it — you must achieve lower tiers before claiming higher ones.

## Tier 1: Minimal

A CLAUDE.md file exists and contains meaningful content (not empty or boilerplate). This is the bare minimum for an agent to receive any project-specific guidance.

## Tier 2: Structured

Instructions are specific and actionable. CLAUDE.md documents the tech stack, architecture, and constraints. Subdirectory instruction files exist where needed. Context management practices (session scoping, compact guidance, sub-agent delegation) are documented. Tool configuration is present and scoped appropriately. Architecture config exists. Onboarding quality is sufficient for a new agent session to be productive.

## Tier 3: Verified

Automated enforcement exists — not just documentation. Hooks run linters and tests on agent output. Hook scripts exist and are referenced in settings. Forbidden patterns are mechanically blocked. Feedback from failures is clear and actionable. Permissions, deny rules, off-limits files, and scope rules constrain what the agent can do. Architecture enforcement goes beyond config to active detection of banned patterns.

## Tier 4: Self-Correcting

The harness improves itself over time. Instructions are checked for contradictions and stale references. Code review results are tracked. Structure drift is detected. Memory is curated. The agent can verify its own work. This tier requires active maintenance, not just initial setup.

## Key Insight

**Existence is not enforcement.** A CLAUDE.md that says "run tests" is Structured. A hook that actually runs tests and blocks on failure is Verified. The gap between tiers 2 and 3 is the gap between documentation and automation.

## Progression

Start at Minimal, work upward. Each tier delivers compounding value. Most projects see the biggest improvement moving from Structured to Verified — that is where phantom completions and convention drift get caught mechanically.
