# Code Craftsmanship Quick Reference

Summary of `standards/full/craftsmanship.md`. Read the full doc for examples and rationale.

---

## Principles

- **DRY** — Every piece of knowledge has ONE representation. But: don't abstract until duplication has shown its shape.
- **KISS** — Simple solutions beat clever ones. Write for the next reader.
- **SRP** — One class, one job, one reason to change.
- **OCP** — Open for extension, closed for modification.
- **LSP** — Subclasses must be substitutable for their base class.
- **ISP** — Don't force clients to depend on methods they don't use.
- **DIP** — Depend on abstractions (injected), not concrete implementations.

---

## Before Writing Code, Ask

1. Am I repeating myself? Is the duplication mature enough to abstract?
2. Is this the simplest solution?
3. Does this class do ONE thing?
4. Can I extend without modifying?
5. Are my interfaces focused?
6. Am I depending on abstractions?

---

## Red Flags

- Copy-pasted blocks
- Functions over ~30 lines
- Classes with "and" in the name
- Inheritance more than 2 levels deep
- Editing working code to add a feature instead of extending
- Giant interfaces nobody fully implements
- Constructors that `new` their own dependencies
- Names that describe *how* instead of *what*
