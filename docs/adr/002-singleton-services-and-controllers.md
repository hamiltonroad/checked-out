# ADR-002: Singleton Services and Controllers

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The application needs a consistent instantiation pattern for services and controllers that avoids unnecessary object creation and keeps modules stateless.

**Decision:** Export singleton instances rather than classes. Each service and controller module creates a single instance and exports it directly. All instances are stateless — they hold no mutable instance data between requests.

```js
// Example: export the instance, not the class
module.exports = new BookService();
```

**Consequences:**
- Simplifies imports — consumers get a ready-to-use object.
- Guarantees statelessness since there is no per-request instance lifecycle.
- Makes it straightforward to mock in tests by replacing the exported object.
- Precludes per-request dependency injection without additional infrastructure.
