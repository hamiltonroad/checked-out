# ADR-036: Adopt React Hook Form for Form State Management

## Status

Accepted

## Date

2026-04-01

## Context

The Checked Out frontend uses manual `useState` hooks for each form field, along with manual validation logic in submit handlers. This pattern leads to:

- **Verbose, repetitive code** — each form field requires its own `useState` call, `onChange` handler, and reset logic.
- **Inconsistent validation** — validation rules are scattered across submit handlers with varying error message patterns.
- **Manual state orchestration** — developers must manually clear validation errors, reset fields on dialog close, and track submission state.
- **No standardized error display** — each form implements its own error presentation pattern.

The application currently has two form components (`CheckoutDialog`, `RatingInput`) that exhibit these patterns. As the application grows, this approach will not scale well.

## Decision

Adopt **React Hook Form** (`react-hook-form`) as the standard form state management library for all frontend forms.

### Key integration points:
- Use `useForm` hook for form state, validation, and submission handling.
- Use `register` for standard HTML/MUI TextField inputs.
- Use `Controller` for non-standard MUI components (e.g., Rating) that require controlled integration.
- Use `formState.errors` with MUI's `error` and `helperText` props for consistent error display.
- Use `formState.isSubmitting` instead of manual submission state tracking.
- Use `reset()` for form resets on dialog close or prop changes.

## Alternatives Considered

### 1. Formik
- Mature library with large community.
- Heavier bundle size (~12.7 KB minified+gzipped vs ~8.6 KB for React Hook Form).
- Uses controlled components by default, causing more re-renders.
- Rejected: React Hook Form offers better performance with uncontrolled components and a smaller bundle.

### 2. Keep manual useState
- No additional dependencies.
- Already familiar to the team.
- Rejected: Does not scale. Leads to code duplication and inconsistent validation as forms grow.

### 3. Custom useForm hook
- Could build a lightweight abstraction internally.
- Rejected: React Hook Form is well-maintained, battle-tested, and provides features (field arrays, schema validation adapters) that would be costly to build and maintain internally.

## Consequences

### Positive
- **Reduced boilerplate** — form fields no longer need individual `useState` + `onChange` pairs.
- **Consistent validation** — validation rules are co-located with field registration.
- **Better performance** — React Hook Form uses uncontrolled components by default, reducing re-renders.
- **Standardized error display** — `formState.errors` provides a consistent pattern for all forms.
- **Smaller API surface** — `useForm`, `register`, `Controller`, and `handleSubmit` cover all use cases.

### Negative
- **New dependency** — adds ~8.6 KB (minified+gzipped) to the bundle.
- **Learning curve** — developers must learn the React Hook Form API.
- **Migration effort** — existing forms require refactoring (two components currently).

### Neutral
- The `@hookform/resolvers` package can be added later if Joi schema validation integration is desired on the frontend.
