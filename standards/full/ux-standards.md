# UX Standards

This document defines the UX principles, heuristics, and laws that all user-facing
work in Checked Out must follow. It is the canonical reference; the quick-ref at
`standards/quick-ref/ux-quick-ref.md` is the at-a-glance version.

## Why this exists

UI work in this project has historically been judged on visual polish and code
quality, not on whether it actually serves users. These standards make UX
expectations explicit so that planning, implementation, and code review can all
hold work to the same bar.

---

## 1. Core Principles ("The Big Seven")

1. **User-centricity** — Decisions are grounded in real user needs (patrons,
   librarians, admins), not assumptions. When in doubt, frame the change as a
   user story and check it against the persona.
2. **Consistency** — Same element, same behavior, everywhere. Buttons, spacing,
   color, terminology, and interaction patterns must match across pages. Use MUI
   theme tokens and shared components (`BookCard`, `EmptyState`, `Pagination`)
   rather than reinventing them.
3. **Hierarchy** — Use scale, weight, contrast, and position to make the most
   important thing on the screen the most visible. Page titles, primary actions,
   and key data should win the eye.
4. **Usability** — Interfaces must be learnable, efficient, memorable, and
   forgiving. New users should succeed on first try; returning users should be
   fast.
5. **User control & freedom** — Always provide an exit. Modals close on Escape.
   Destructive actions confirm. Multi-step flows allow back/cancel. Mistakes are
   reversible whenever possible.
6. **Accessibility** — WCAG 2.1 AA is the floor. See section 4.
7. **Context** — Design for where and how the product is actually used. Library
   staff use desktops at a circulation desk; patrons may browse on a phone in a
   stack. Touch targets, contrast, and load behavior must respect both.

---

## 2. Nielsen's 10 Usability Heuristics

Every page and component should be reviewed against all ten:

1. **Visibility of system status** — The user always knows what's happening.
   Loading skeletons, spinners, optimistic UI, success/error toasts.
2. **Match between system and the real world** — Use the user's language
   ("Check out", "Return", "Hold"), not internal jargon ("create transaction").
3. **User control & freedom** — Undo, cancel, close, back. No dead ends.
4. **Consistency & standards** — Follow MUI conventions and existing patterns
   in this codebase. Don't surprise the user.
5. **Error prevention** — Confirm destructive actions. Disable submit until
   forms are valid. Use selects instead of free text where possible.
6. **Recognition rather than recall** — Show options instead of making the user
   remember them. Autocomplete. Recently-used. Visible labels (not placeholder-only).
7. **Flexibility & efficiency of use** — Keyboard shortcuts (`⌘K` for search,
   `Esc` to clear), bulk actions, sensible defaults.
8. **Aesthetic & minimalist design** — Every element on screen earns its place.
   Remove decoration that doesn't communicate.
9. **Help users recognize, diagnose, and recover from errors** — Plain-language
   error messages that say what went wrong AND how to fix it. Never expose
   stack traces or error codes alone.
10. **Help & documentation** — Inline hints where needed. Tooltips for icon-only
    buttons. Empty states explain what to do next.

---

## 3. UX Laws

| Law | Implication for our work |
|-----|---------------------------|
| **Jakob's Law** — Users prefer interfaces that work like the ones they already know. | Use MUI defaults and standard web patterns. Don't invent novel interactions. |
| **Hick's Law** — More choices = slower decisions. | Limit menu items, filter chips, and primary actions per screen. Group and progressively disclose. |
| **Miller's Law** — Working memory holds ~7 items. | Keep nav items, columns, and form fields per step under ~7. Chunk long forms. |
| **Fitts's Law** — Time to acquire a target depends on size and distance. | Primary actions must be large and reachable. Minimum touch target 44×44px. Place destructive actions away from primary ones. |
| **Doherty Threshold** — Productivity soars when interaction < 400ms. | Show feedback within 100ms; complete or show progress within 400ms. Use optimistic updates. |
| **Tesler's Law** — Complexity is conserved; someone has to absorb it. | When in doubt, the system absorbs complexity, not the user. |

---

## 4. Accessibility (WCAG 2.1 AA)

Mandatory baseline:

- All interactive elements reachable by keyboard, with visible focus.
- Color contrast ≥ 4.5:1 for normal text, 3:1 for large text and UI components.
- All images have meaningful `alt` text (or `alt=""` if decorative).
- All form inputs have associated `<label>`s — placeholder is not a label.
- Icon-only buttons have `aria-label`.
- No information conveyed by color alone.
- Modals trap focus and restore it on close. Escape closes them.
- Dynamic content updates are announced via ARIA live regions where appropriate.
- Page has a single `<h1>`; heading levels do not skip.

---

## 5. Project-specific applications

- **Loading** — Pages backed by `useQuery` must render a skeleton or spinner
  while `isLoading`. Pattern: see `BooksPageSkeleton`.
- **Errors** — All `useQuery` errors must surface a user-readable `Alert`, not
  a blank screen.
- **Empty states** — Use `EmptyState` with an icon, title, message, and (where
  applicable) a CTA. Never render an empty `<Grid>` silently.
- **Destructive actions** — Delete, return-without-checkout, cancel-hold, etc.
  must use a confirmation `Dialog`. Buttons use `color="error"`.
- **Forms** — Inline validation. Disable submit until valid. Show field errors
  on blur, not on first keystroke.
- **Modals** — Use MUI `Dialog`, which handles focus trap + Escape. Don't roll
  custom modals.
- **Theme tokens** — No inline `style`, no hex colors, no hard-coded spacing.
  Use the `sx` prop with theme tokens.

---

## 6. Code review checklist

Reviewers must check, for any user-facing change:

- [ ] Loading state present
- [ ] Error state present
- [ ] Empty state present (where applicable)
- [ ] Destructive actions confirmed
- [ ] Keyboard reachable; visible focus
- [ ] All interactive elements have accessible names
- [ ] Color contrast meets AA
- [ ] No new inline styles or hard-coded colors/spacing
- [ ] Touch targets ≥ 44px
- [ ] Copy uses user language, not internal terms
- [ ] No dead ends (every flow has an exit)

---

## 7. Mechanical enforcement (current and planned)

See `standards/enforcement-registry.md` for the live list. Rules tagged
`HARNESS-UX-*` enforce subsets of this standard. Items marked **planned** are
not yet wired up.

| Rule | Status | What it catches |
|------|--------|------------------|
| `jsx-a11y/alt-text` | planned | Images without `alt` |
| `jsx-a11y/anchor-has-content` | planned | Empty links / "click here" |
| `jsx-a11y/anchor-is-valid` | planned | `<a>` used as button |
| `jsx-a11y/aria-props` + `aria-role` | planned | Invalid ARIA |
| `jsx-a11y/click-events-have-key-events` | planned | Click handlers without keyboard equivalent |
| `jsx-a11y/no-static-element-interactions` | planned | `<div onClick>` without role |
| `jsx-a11y/label-has-associated-control` | planned | Labels not bound to inputs |
| `jsx-a11y/no-autofocus` | planned | Autofocus traps screen readers |
| `jsx-a11y/heading-has-content` | planned | Empty headings |
| `jsx-a11y/iframe-has-title` | planned | Untitled iframes |
| `jsx-a11y/media-has-caption` | planned | Audio/video without captions |
| HARNESS-UX-NO-INLINE-STYLE | planned | `style={{...}}` on MUI components (use `sx`) |
| HARNESS-UX-NO-HARDCODED-COLOR | planned | Hex/rgb literals in JSX (use theme tokens) |
| HARNESS-UX-LOADING-STATE | planned | Components calling `useQuery` that never reference `isLoading` |
| HARNESS-UX-ERROR-STATE | planned | Components calling `useQuery` that never reference `error` |
| HARNESS-UX-ICON-BUTTON-LABEL | planned | `IconButton` without `aria-label` |
| HARNESS-UX-CONFIRM-DESTRUCTIVE | planned | `useMutation` for delete-shaped operations not paired with a `Dialog` import in the same file |
| HARNESS-UX-PAGE-H1 | planned | Page components missing a `variant="h4"`/`component="h1"` heading |
| HARNESS-UX-EMPTY-STATE | planned | Pages rendering data lists without referencing `EmptyState` |

The first block (`jsx-a11y/*`) is satisfied by adding `eslint-plugin-jsx-a11y`
to `frontend/eslint.config.js` with the `recommended` config — that single
change enforces ~12 rules at once. The HARNESS-UX-* rules require small custom
ESLint rules or bash scripts (same shape as existing `scripts/check-*.sh`).

What is **not** mechanically enforceable and must be caught in review:

- Hierarchy (which element is most prominent)
- Whether copy uses user language
- Whether a flow has dead ends
- Whether a confirmation is justified
- Color contrast at the design level (axe-core in e2e is the closest tool)
- Whether a touch target is large enough in context (CSS-dependent)
