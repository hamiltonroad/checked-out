# ADR-008: No Peer Service Imports — Controller Orchestration

**Status:** Accepted
**Date:** 2026-04-01

**Context:** When services import other services, it creates hidden coupling, circular dependency risks, and makes it difficult to reason about the dependency graph.

**Decision:** Services must never import peer services. When an operation requires data or logic from multiple services, the controller is responsible for orchestrating those calls and passing results between them.

```
Controller: result1 = serviceA.doX()
            result2 = serviceB.doY(result1)
            return combined response
```

**Consequences:**
- Each service has a clear, isolated responsibility.
- Eliminates circular dependency risk at the service layer.
- Controllers become the explicit coordination point, making data flow visible.
- Controllers may grow in complexity when orchestrating many services.
