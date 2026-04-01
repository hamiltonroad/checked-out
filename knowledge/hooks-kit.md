# Hooks and Back-Pressure

How to make verification automatic, not optional.

## Hook System Mechanics

Shell commands that Claude Code runs automatically at specific points in the agent's workflow. Configured in `.claude/settings.json` (project) or `~/.claude/settings.json` (user).

**Hook Types:**

- **PreToolUse** — Runs before agent uses a tool. Non-zero exit = tool use blocked.
- **PostToolUse** — Runs after agent uses a tool. Non-zero exit = agent sees error and can respond.
- **Notification** — Runs when agent sends notification.

**Valid Matcher Names:**

Matchers correspond to Claude Code tool names. Use pipe (`|`) to match multiple tools:

- `Edit` — file edit tool
- `Write` — file write tool
- `Bash` — shell command tool
- `Read` — file read tool
- `Glob` — file pattern matching tool
- `Grep` — content search tool
- `Edit|Write` — matches both edit and write (most common for lint/format hooks)

**Note:** `write_to_file` is NOT a valid Claude Code tool name (it belongs to other AI coding tools). Always use `Edit|Write` for file-mutation hooks.

**Hook Environment Variables:**

- `$CLAUDE_PROJECT_DIR` — the project root directory (always available)

File path context is passed via stdin as JSON, not as an environment variable. Hook scripts should parse stdin for file-specific information, or delegate to shell scripts that handle this.

**How they work:**

1. Agent calls a tool (e.g., Edit or Write)
2. Claude Code checks for matching hooks
3. Hook command runs with context via stdin JSON
4. Exit 0 = success, proceed
5. Non-zero = failure, agent sees error output and can fix

## Concrete Hook Examples

### Lint-on-Save (TypeScript)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/lint.sh"
          }
        ]
      }
    ]
  }
}
```

### Lint-on-Save (Python)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/ruff-lint.sh"
          }
        ]
      }
    ]
  }
}
```

### Format Checker (Prettier)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/format.sh"
          }
        ]
      }
    ]
  }
}
```

### Forbidden File Protection (PreToolUse)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

### Protect Migration Files

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/protect-migrations.sh"
          }
        ]
      }
    ]
  }
}
```

### Security Scanner (Hardcoded Secrets)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/secret-scanner.sh"
          }
        ]
      }
    ]
  }
}
```

### Build Verification (TypeScript)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/typecheck.sh"
          }
        ]
      }
    ]
  }
}
```

### Complete Configuration Example

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/protect-files.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/typecheck.sh"
          },
          {
            "type": "command",
            "command": "bash .claude/hooks/lint.sh"
          },
          {
            "type": "command",
            "command": "bash .claude/hooks/secret-scanner.sh"
          }
        ]
      }
    ]
  }
}
```

## Hook Command Convention

- **Project-wide commands** (pre-commit): use `npm run <script>` (e.g., `npm run typecheck`, `npm test`)
- **Per-file commands** (Claude Code hooks): use `npx <tool>` (e.g., `npx eslint "$FILE_PATH"`)
- **Never use bare tool names** (e.g., `tsc`) — they depend on global installs and break across environments

## Verification Stack Layers

| Layer                 | Speed           | Catches                                                          | Hook Pattern                          |
| --------------------- | --------------- | ---------------------------------------------------------------- | ------------------------------------- |
| **Type Checking**     | Milliseconds    | Syntax errors, type mismatches, missing imports                  | PostToolUse: `tsc --noEmit`           |
| **Linting**           | Seconds         | Style violations, banned patterns, naming drift                  | PostToolUse: `eslint`, `ruff`         |
| **Unit Tests**        | Seconds-minutes | Logic errors, wrong return values, missing error handling        | PostToolUse or CLAUDE.md instructions |
| **Integration Tests** | Minutes         | Layer interaction bugs, DB query issues, API contract violations | CLAUDE.md: run before committing      |
| **Human Review**      | Variable        | Architectural drift, unnecessary complexity, wrong approach      | PR process                            |

## Test-Driven Back-Pressure

The red-green workflow:

1. Write tests (or have agent write them, then review)
2. Run tests — they fail (red)
3. Tell agent: "Make these tests pass"
4. Agent implements, runs tests, self-corrects on failure
5. All tests pass (green) — done

## Pre-Commit Hook as Safety Net

```bash
#!/bin/bash
# .git/hooks/pre-commit
set -e

echo "Running pre-commit checks..."
echo "  Type checking..."
npx tsc --noEmit 2>&1 | grep -i "error" && exit 1 || true

echo "  Linting..."
npx eslint src/ --format compact 2>&1 | grep -i "error" && exit 1 || true

echo "  Running tests..."
CHANGED=$(git diff --cached --name-only --diff-filter=ACMR | grep 'src/' | head -20)
if [ -n "$CHANGED" ]; then
  PATTERNS=$(echo "$CHANGED" | sed 's|src/||' | sed 's|\.ts$||' | tr '\n' '|' | sed 's/|$//')
  npx jest --testPathPattern="$PATTERNS" --silent 2>&1 | grep -A 5 'FAIL\|Error' && exit 1 || true
fi

echo "All pre-commit checks passed."
```

## Filtering Output (Keep Context Clean)

```bash
# TypeScript — errors only
npx tsc --noEmit 2>&1 | grep -E "^src/.*error TS" | head -20

# ESLint — compact format
npx eslint "$FILE" --format compact 2>&1 | head -30

# Jest — failures only
npx jest --testPathPattern="$MODULE" --silent 2>&1 | grep -A 5 'FAIL\|Error\|✗'

# Pytest — short summary
python -m pytest tests/ -q --tb=short 2>&1 | grep -E "FAILED|ERROR" -A 10
```
