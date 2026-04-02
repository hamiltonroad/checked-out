# Code Craftsmanship Standards

## KISS (Keep It Simple)

Prefer the straightforward solution. If an approach needs a paragraph to explain, find a simpler one. Flat is better than nested. Small functions over clever one-liners.

## DRY (Don't Repeat Yourself)

Extract shared logic when the same pattern appears three or more times. Two similar blocks are fine — three means refactor. But never DRY at the cost of readability.

## YAGNI (You Aren't Gonna Need It)

Do not build for hypothetical future requirements. No feature flags, extension points, or abstractions "in case we need it later." Solve today's problem today.

## Readability and Intent

Code should communicate _why_, not just _what_. Use descriptive names that reveal purpose. A reader should understand a function's intent without reading its body. Comments explain _why_ something unusual exists, not _what_ the code does.

## Intent Over Mechanics

Rules express the _why_, not just the _what_. A rule that says "write a one-line JSDoc" tells agents what to type but not what to achieve. Prefer: "document behavior that could surprise callers." When agents understand the intent, they generalize correctly to novel situations instead of complying with the letter and missing the spirit.

## Consistency Over Cleverness

Match the patterns already in the codebase. A consistent codebase where every file looks familiar is worth more than a locally optimal but unfamiliar approach. When in doubt, do it the way the rest of the project does it.

## Small, Related Commits

Commit early and often as logical units of work complete. A commit should capture one coherent change — a new type, a new function, a wiring step, a test suite. Do not batch all changes into a single commit at the end. Small commits are easier to review, easier to revert, and tell the story of how the implementation was built.

## Search Before Building

Before creating a new function, type, or helper, search the codebase for existing implementations that serve the same purpose. If a similar function exists, reuse or extend it rather than creating a duplicate.

## Safe Content Moves During Refactoring

When moving content between files, verify the target file contains the moved content before deleting from the source. Never delete-then-recreate — the intermediate state where content exists in neither file is a data-loss risk that hooks and tests cannot catch.

## Prefer Native Builtins

Prefer native language and platform built-ins over custom reimplementations. Before writing a utility function, search docs for an existing API that serves the same purpose. Custom utilities are justified only when the native API has an ergonomic gap that affects multiple call sites.

## Boy Scout Rule (Scoped)

Leave every file you touch better than you found it. If you encounter standards violations, architecture rule breaks, or code quality issues in a file you are already modifying for the current task — fix them. Do not go hunting through unrelated files.

**Scope:** Only files you are already editing for the current issue. If you see a violation in a file you are not otherwise changing, note it but do not touch it.

**Commits:** Preexisting fixes go in their own commit, separate from feature work. Use a clear message like `fix: address preexisting violations in <file>`. This keeps PRs reviewable and changes independently revertable.

**"Preexisting" is not an excuse.** If code is in your diff, it is in scope for review and correction. The fact that a violation existed before does not mean it should ship again.
