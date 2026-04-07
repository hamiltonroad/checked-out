# UX Quick Reference

Full standard: [`standards/full/ux-standards.md`](../full/ux-standards.md)

## The Big Seven
User-centricity · Consistency · Hierarchy · Usability · User control & freedom · Accessibility · Context

## Nielsen's 10 Heuristics
1. Visibility of system status
2. Match system & real world
3. User control & freedom
4. Consistency & standards
5. Error prevention
6. Recognition over recall
7. Flexibility & efficiency
8. Aesthetic & minimalist design
9. Help users recover from errors
10. Help & documentation

## UX Laws
- **Jakob** — work like other sites
- **Hick** — fewer choices = faster decisions
- **Miller** — chunk to ~7
- **Fitts** — big & near for primary actions (≥44px)
- **Doherty** — feedback < 400ms
- **Tesler** — system absorbs complexity, not user

## Must-have on every user-facing change
- [ ] Loading state
- [ ] Error state
- [ ] Empty state (where applicable)
- [ ] Destructive actions confirmed
- [ ] Keyboard reachable + visible focus
- [ ] Accessible names on all interactive elements
- [ ] AA color contrast
- [ ] Theme tokens only (no inline styles, no hex)
- [ ] Touch targets ≥ 44px
- [ ] User-language copy
- [ ] No dead ends

## Project patterns
- Loading → `BooksPageSkeleton` / `CircularProgress`
- Empty → `<EmptyState icon title message action />`
- Error → `<Alert severity="error" />`
- Confirm → MUI `<Dialog>` with cancel + destructive action
- Modal → MUI `<Dialog>` (handles focus trap + Escape)
