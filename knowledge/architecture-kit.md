# Architecture Enforcement

How to make architecture mechanical rather than aspirational.

## Why Architecture Matters More for Agents

- Humans absorb conventions through code reviews and conversations over months
- Agents start fresh every session; infer architecture from whatever code is in context
- Agents cut corners with zero awareness the corners exist
- **But**: Constraints make agents faster, not slower (narrow solution space = converge faster)

## Classic Four-Layer Model

| Layer              | Responsibility                          |
| ------------------ | --------------------------------------- |
| **Presentation**   | Routes, handlers, UI components         |
| **Application**    | Use cases, orchestration, workflows     |
| **Domain**         | Business rules, entities, value objects |
| **Infrastructure** | Database, external APIs, file system    |

**Key Rule:** Dependencies flow downward only.

## Bounded Domains (Vertical Slices)

Within layers, divide by business domain: Users, Billing, Inventory, etc.

- No cross-domain imports except through `shared/interfaces/`
- Agents can work on one domain without entire codebase in context

## The 300-Line Rule

Files should be describable in one sentence. Over 300 lines = likely needs splitting.

```
# Before: 780 lines
src/services/user.service.ts

# After: four focused files
src/services/auth.service.ts          # 190 lines
src/services/profile.service.ts       # 140 lines
src/services/password.service.ts      # 160 lines
src/services/verification.service.ts  # 120 lines
```

**Why small files matter for agents:**

- Fit in context without crowding
- Reduce blast radius of changes
- Enable better search (grep returns precise results)

## Naming as Navigation

**Bad** — names don't tell you what's inside:

```
src/helpers.ts, src/utils.ts, src/misc.ts, src/handlers.ts
```

**Good** — names describe contents:

```
src/auth.service.ts, src/password-reset.service.ts, src/invoice.routes.ts
```

Consistent naming convention everywhere. If services use `{thing}.service.ts`, don't break the pattern.

## Module Boundary Enforcement

```typescript
// Bad: billing reaches into user internals
import { userDatabase } from "../users/internal/database-connection";

// Good: billing uses user module's public interface
import { getUserById } from "../users";
```

Index files as contracts: things in the index are public, everything else is private.

## Architecture Definition File (.harness/architecture.json)

Machine-readable. Read by agents, validated by linters, enforced by CI.

```json
{
  "layers": {
    "presentation": {
      "path": "src/routes/",
      "description": "HTTP route handlers — parse request, delegate, format response",
      "canDependOn": ["application"]
    },
    "application": {
      "path": "src/services/",
      "description": "Use cases and orchestration",
      "canDependOn": ["domain", "infrastructure"]
    },
    "domain": {
      "path": "src/domain/",
      "description": "Business rules, entities, value objects",
      "canDependOn": []
    },
    "infrastructure": {
      "path": "src/repositories/",
      "description": "Database access and external APIs",
      "canDependOn": ["domain"]
    }
  },
  "domains": ["users", "billing", "inventory", "notifications"],
  "crossDomainRule": "No cross-domain imports except through shared/interfaces/",
  "bannedPatterns": [
    {
      "pattern": "db.query|.execute(",
      "excludePaths": ["src/repositories/", "src/config/"],
      "message": "Direct database queries outside repositories"
    },
    {
      "pattern": "process.env",
      "excludePaths": ["src/config/"],
      "message": "Environment variable access outside config module"
    },
    {
      "pattern": "console.log",
      "excludePaths": ["scripts/"],
      "message": "Use structured logger instead of console.log"
    }
  ]
}
```

## Custom Linter Script Pattern

Error messages must include fix instructions — they teach the agent how to do it right.

```bash
#!/bin/bash
# scripts/check-architecture.sh

ERRORS=0

# No database calls outside repositories
DB_VIOLATIONS=$(grep -rn "db\.\|\.query(\|\.execute(" src/ \
  | grep -v "src/repositories/" \
  | grep -v "src/config/" || true)

if [ -n "$DB_VIOLATIONS" ]; then
    echo "ERROR: Database queries found outside repository layer:"
    echo "$DB_VIOLATIONS"
    echo ""
    echo "FIX: Move database queries to the appropriate repository file."
    ERRORS=$((ERRORS + 1))
fi

# No direct env access outside config
ENV_VIOLATIONS=$(grep -rn "process\.env" src/ \
  | grep -v "src/config/" || true)

if [ -n "$ENV_VIOLATIONS" ]; then
    echo "ERROR: Direct environment variable access outside config:"
    echo "$ENV_VIOLATIONS"
    echo ""
    echo "FIX: Access environment variables through src/config/."
    ERRORS=$((ERRORS + 1))
fi

exit $ERRORS
```

**Helpful error message format:**

```
ERROR: src/billing/routes/create-invoice.ts imports from
       src/users/repositories/UserRepository.ts

VIOLATION: Cross-domain import detected. billing/ cannot
           import directly from users/

FIX: Cross-domain access must go through shared interfaces.
     1. Check if an interface exists in src/shared/interfaces/
     2. If not, create one (e.g., UserLookup.ts)
     3. Import the interface, not concrete implementation
```

## Brownfield Strategies

For existing codebases, don't rewrite everything. Enforce going forward.

**Start with naming conventions for new files:**

```markdown
## Naming Rules (for new files)

- Services: {resource}.service.ts
- Repositories: {resource}.repository.ts

Note: Some existing files don't follow these conventions.
Follow the conventions above for all NEW files.
Do not rename existing files unless explicitly asked.
```

**Use reference implementations:**

```markdown
## Reference Implementations

Follow patterns in these files for new code:

- Service: src/features/reporting/report.service.ts
- Repository: src/features/reporting/report.repository.ts

Do NOT use files in src/legacy/ as references.
```

**Document current vs. target state:**

```markdown
## Architecture Direction

Migrating from flat service structure to domain-based organization.
New code: src/features/{feature-name}/
Legacy code: src/services/ — may import from but do not modify
```

## Common Mistakes

1. **Over-constraining**: 47 rules before first session. Start with 5-10; add based on observed violations.
2. **Under-specifying**: "Keep things clean" isn't testable. Every constraint must be machine-testable.
3. **Forgetting to update**: Architecture file reflects original design but project evolved.
4. **Too complex**: If a rule needs three paragraphs, simplify to one sentence.
5. **One-time decision**: Architecture should evolve with the project.
6. **Not building for deletion**: Design constraints for clean removal when models improve.

## Code Health Threshold

Research shows agents perform optimally on code with health scores 9.5+ (out of 10). Below this, agent performance degrades — struggles with tangled dependencies, unclear naming, inconsistent patterns.
