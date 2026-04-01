# Tools and Trust

Permission modes, trust zones, MCP servers, and the "fewer tools, better results" principle.

## Three-Zone Trust Model

| Zone                    | Access               | Examples                                                                                  |
| ----------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| **Zone 1: Full Access** | Read + write         | Working source code, test suite, local dev DB, build tooling                              |
| **Zone 2: Read-Only**   | Reference only       | Production configs, shared type definitions, internal docs, dependency manifests          |
| **Zone 3: No Access**   | Mechanically blocked | Production databases, secret stores, deployment pipelines, customer data, payment systems |

**Critical:** Zone 3 boundaries must be mechanically enforced. "Don't access production database" in CLAUDE.md is instructional. No credentials = mechanical boundary.

## Permission Modes

- **Default**: Agent asks before potentially destructive operations. Safest starting point.
- **Auto-allow with rules**: Patterns for auto-approved operations. `npm test` runs without asking; `rm -rf` needs approval.
- **Fully permissive**: Everything runs without asking. Only for sandboxed environments or CI/CD.

**Principle:** Start restrictive, open up as needed.

## Permission Configuration Examples

### Web App (Balanced)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Edit",
      "Write",
      "Bash(npm test*)",
      "Bash(npm run lint*)",
      "Bash(npm run build*)",
      "Bash(npx tsc*)",
      "Bash(git status*)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add*)",
      "Bash(git commit*)",
      "Bash(ls *)",
      "Bash(curl http://localhost*)"
    ],
    "deny": [
      "Bash(curl*POST*)",
      "Bash(rm -rf*)",
      "Bash(npm publish*)",
      "Bash(docker*)",
      "Bash(ssh*)",
      "Read(**/.env*)",
      "Read(~/.ssh/*)",
      "Read(~/.aws/*)"
    ]
  }
}
```

### API Service (Tighter)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Edit(src/**)",
      "Edit(tests/**)",
      "Write(src/**)",
      "Write(tests/**)",
      "Bash(go test*)",
      "Bash(go build*)",
      "Bash(go vet*)",
      "Bash(make lint*)",
      "Bash(git *)",
      "Bash(ls *)"
    ],
    "deny": [
      "Write(deploy/**)",
      "Write(infrastructure/**)",
      "Write(Makefile)",
      "Bash(docker push*)",
      "Bash(kubectl*)",
      "Bash(terraform*)",
      "Bash(curl*POST*)",
      "Bash(curl*PUT*)",
      "Bash(curl*DELETE*)",
      "Read(**/.env*)",
      "Read(~/.kube/*)"
    ]
  }
}
```

## "Fewer Tools, Better Results" — The Vercel Finding

Vercel built an analytics agent with 15 specialized tools, then stripped to bash + standard Unix utilities.

| Metric              | 15 Tools | Bash Only  |
| ------------------- | -------- | ---------- |
| Accuracy            | 80%      | **100%**   |
| Token usage (worst) | 145,000  | **67,000** |
| Steps (worst)       | 100      | **19**     |
| Speed (worst)       | 724s     | **141s**   |

**Why fewer tools work better:**

- Every tool is a decision the agent must make
- Tool descriptions consume context (15 tools = 5,000-10,000 tokens)
- Specialized tools overlap, creating fuzzy boundaries
- General tools (bash) are self-correcting

**Rule:** Start with zero extra tools. Add one when there's a specific, repeated need.

**Tools that commonly earn their place:** Database query (read-only), browser automation (Playwright), GitHub integration, error monitoring (Sentry).

**Tools that rarely earn their place:** Slack, email, calendar, git MCP wrappers, generic HTTP tools, filesystem MCP servers.

## MCP Server Configuration

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DEV_DATABASE_URL}"
      }
    }
  }
}
```

**Critical:** Always use `${VAR}` syntax for credentials. Never hardcode.

## Tool Poisoning Risks

Malicious tool descriptions can influence agent behavior. A tool description can instruct the agent to read sensitive files and include them in parameters.

**How to vet MCP servers:**

1. Read the source code — if not open source, don't install
2. Check every tool description for suspicious instructions
3. Monitor network traffic on first run
4. Pin versions and audit updates
5. Prefer official/well-known servers

**Risk:** A single malicious server can influence how the agent interacts with legitimate servers in the same session.

## Common Trust Leaks

| Leak                                   | Fix                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| Agent has production DB access         | Use `DEV_DATABASE_URL`; create read-only DB user for agent                     |
| No file modification restrictions      | Scope writes: `Write(src/**)`, deny: `Write(deploy/**)`                        |
| Secrets in environment variables       | Separate shell profile for agent sessions; deny `Bash(env)`, `Bash(printenv)`  |
| Hardcoded credentials in .mcp.json     | Always use `${VARIABLE_NAME}` syntax; pre-commit hook scanning for credentials |
| Too many MCP servers consuming context | Ruthlessly remove unused servers; consider task-specific configurations        |
