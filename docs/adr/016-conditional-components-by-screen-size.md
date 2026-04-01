# ADR-016: Conditional Components by Screen Size

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Some views have fundamentally different layouts on mobile versus desktop — not just reflowed content, but different component hierarchies, interactions, and information density.

**Decision:** Render entirely different components based on screen size rather than making a single component responsive with CSS media queries. Screen-size detection determines which component tree to mount.

**Consequences:**
- Each variant is simpler and optimized for its target screen size.
- Avoids deeply nested conditional rendering within a single component.
- Mobile and desktop experiences can evolve independently.
- Duplicates some logic and markup between variants.
- Screen-size breakpoint must be consistent across the application.
