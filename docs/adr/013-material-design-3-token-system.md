# ADR-013: Material Design 3 Token System

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The UI needs consistent visual styling. Inline color values and ad-hoc spacing lead to drift and make theming changes expensive.

**Decision:** Adopt a Material Design 3-inspired token system implemented as modular MUI theme files:

- **Palette** — semantic color tokens (primary, secondary, error, surface, etc.)
- **Typography** — type scale with predefined variants.
- **Spacing** — 8px base grid via the MUI `theme.spacing()` function.
- **Motion** — transition duration and easing tokens.

No inline color or spacing values are permitted in component code. All values must reference theme tokens.

**Consequences:**
- Theme changes propagate globally by editing token files.
- Enforces visual consistency across all components.
- Designers and developers share a common vocabulary.
- Requires discipline to avoid hardcoded values — enforced by code review.
