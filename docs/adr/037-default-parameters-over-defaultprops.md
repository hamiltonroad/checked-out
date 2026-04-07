# ADR-037: JavaScript Default Parameters Over defaultProps

**Status:** Accepted
**Date:** 2026-04-01

**Context:** React 18.3+ emits deprecation warnings when function components use the static `defaultProps` property. The React team has signaled that `defaultProps` will be removed for function components in a future major version, as JavaScript default parameters provide the same capability natively.

**Decision:** All function components use JavaScript default parameters in the destructured props signature instead of `Component.defaultProps`. The `defaultProps` pattern is reserved only for class components (none exist in this codebase). Example:

```jsx
// Preferred
function MyComponent({ size = 'medium', count = 0 }) { ... }

// Deprecated — do not use for function components
MyComponent.defaultProps = { size: 'medium', count: 0 };
```

**Alternatives Considered:**
- **Keep defaultProps:** Would continue to trigger deprecation warnings and will break in a future React version.
- **Add eslint-plugin-react with `react/no-default-props` rule:** The project does not currently use eslint-plugin-react. Adding it solely for one rule introduces unnecessary dependency weight. This can be revisited if the plugin is needed for other rules in the future.

**Consequences:**
- Eliminates all React deprecation warnings related to `defaultProps`.
- Default values are colocated with the parameter declaration, improving readability.
- Aligns with the existing CLAUDE.md convention that already mandated this pattern.
- No runtime behavior change — JavaScript default parameters behave identically to `defaultProps` for function components.
- Future developers should use default parameters from the start; no migration needed.
