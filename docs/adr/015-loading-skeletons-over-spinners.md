# ADR-015: Loading Skeletons over Spinners

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Loading indicators affect perceived performance. Generic spinners provide no spatial context and cause layout shifts when content appears.

**Decision:** Use Skeleton components that mimic the shape of the page layout during loading states instead of generic spinners. Each page or major section has a corresponding skeleton that matches its rendered structure.

**Consequences:**
- Reduces perceived loading time by showing the page structure immediately.
- Eliminates layout shifts since skeletons occupy the same space as real content.
- Requires building and maintaining a skeleton variant for each major view.
- Skeletons must be updated when page layouts change.
