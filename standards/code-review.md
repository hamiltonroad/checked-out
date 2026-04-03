# Code Review Standard

## Scope

This standard defines how code reviews are evaluated for the Checked Out project.
Customize the criteria below to match your team's priorities.

## Severity Levels

| Level | Meaning | Action Required |
| --- | --- | --- |
| **Critical** | Breaks functionality, security vulnerability, data loss risk | Must fix before merge |
| **Major** | Architectural violation, missing error handling, untested path | Should fix before merge |
| **Minor** | Style inconsistency, naming, missing docs | Fix if convenient |
| **Nit** | Preference, suggestion, optional improvement | Author's discretion |

## Evaluation Criteria

### Architecture
- Follows 3-tier separation: routes -> controllers -> services -> models
- No business logic in controllers or route handlers
- No direct database queries outside models/services
- No cross-layer imports that skip levels

### Code Quality
- DRY: No duplicated logic (extract to service or utility)
- KISS: Simplest solution that meets requirements
- SOLID: Single responsibility per file/function
- Error handling: All async operations have try/catch or .catch()
- No console.log in production code (use structured logger)

### Testing
- New features have corresponding test coverage
- API endpoints tested with real database (no mocks for integration tests)
- Edge cases covered (empty input, invalid data, not found)

### Security
- No hardcoded credentials or API keys
- SQL injection protected (use parameterized queries / Sequelize ORM)
- Input validation on all user-facing endpoints
- No XSS vulnerabilities in frontend (sanitize user content)

### Frontend
- PropTypes defined for all components
- Material UI theme used (no inline color/spacing values)
- Responsive design considered
- Accessibility basics (alt text, aria labels, semantic HTML)

### Documentation
- Complex logic has explanatory comments (why, not what)
- API endpoints documented with request/response examples
- Migration files have descriptive names

### Harness
- `.claude/settings.json` hooks must have observable effect -- flag no-op hooks (hooks that exit 0 for all inputs without gating anything)

## Review Output

Reviews should produce:
1. Summary of changes reviewed
2. List of findings by severity
3. Overall recommendation: Approve / Request Changes / Needs Discussion
