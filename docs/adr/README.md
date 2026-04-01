# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Checked Out application. Each ADR documents a significant architectural decision, its context, and consequences.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [001](001-layered-architecture.md) | Layered Architecture | Accepted |
| [002](002-singleton-services-and-controllers.md) | Singleton Services and Controllers | Accepted |
| [003](003-custom-api-error-class.md) | Custom ApiError Class with HTTP Semantics | Accepted |
| [004](004-standardized-api-response-wrapper.md) | Standardized ApiResponse Wrapper | Accepted |
| [005](005-joi-validation-via-middleware.md) | Joi Validation via Middleware | Accepted |
| [006](006-sequelize-factory-pattern-deferred-associations.md) | Sequelize Factory Pattern with Deferred Associations | Accepted |
| [007](007-calculated-fields-via-sequelize-literal.md) | Calculated Fields via sequelize.literal() | Accepted |
| [008](008-no-peer-service-imports.md) | No Peer Service Imports — Controller Orchestration | Accepted |
| [009](009-url-path-api-versioning.md) | URL Path API Versioning | Accepted |
| [010](010-react-query-for-server-state.md) | React Query for Server State, Context for UI State | Accepted |
| [011](011-service-hook-component-separation.md) | Service -> Hook -> Component Separation | Accepted |
| [012](012-axios-singleton-with-interceptor.md) | Axios Singleton with Request Interceptor | Accepted |
| [013](013-material-design-3-token-system.md) | Material Design 3 Token System | Accepted |
| [014](014-directory-per-component-with-barrel-exports.md) | Directory-per-Component with Barrel Exports | Accepted |
| [015](015-loading-skeletons-over-spinners.md) | Loading Skeletons over Spinners | Accepted |
| [016](016-conditional-components-by-screen-size.md) | Conditional Components by Screen Size | Accepted |
| [017](017-winston-structured-logging.md) | Winston Structured Logging | Accepted |
| [018](018-bash-startup-scripts-with-auto-setup.md) | Bash Startup Scripts with Auto-Setup | Accepted |
| [019](019-environment-based-database-configuration.md) | Environment-Based Database Configuration | Accepted |
| [020](020-sequelize-migrations-with-timestamp-naming.md) | Sequelize Migrations with Timestamp Naming | Accepted |
| [021](021-middleware-ordering.md) | Middleware Ordering | Accepted |
| [022](022-error-responses-through-apiresponse.md) | Error Responses Through ApiResponse | Accepted |
| [023](022-default-parameters-over-defaultprops.md) | Default Parameters over defaultProps | Accepted |
| [024](024-no-console-eslint-enforcement.md) | No-Console ESLint Enforcement | Accepted |
| [025](025-deep-health-check-with-database-connectivity.md) | Deep Health Check with Database Connectivity | Accepted |

## Format

Each ADR follows this structure:

- **Status** — Accepted, Superseded, or Deprecated
- **Date** — When the decision was recorded
- **Context** — Why the decision was needed
- **Decision** — What was decided
- **Consequences** — Trade-offs, what it enables, what it prevents
