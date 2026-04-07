# Code Craftsmanship Standards

Core principles for writing maintainable, professional code. The quick-ref summarizes this file; this file is canonical.

---

## DRY — Don't Repeat Yourself

**Principle:** Every piece of knowledge should have a single, unambiguous representation within a system.

**Apply:**
- Extract repeated code into reusable functions, classes, or modules
- Use abstraction to eliminate redundancy
- Changes should only need to be made in one place

**Benefits:** Easier maintenance, fewer inconsistencies, less code to test and debug.

**Caveat:** Premature abstraction is worse than duplication. Three similar lines of code is usually better than a wrong abstraction. Wait until the duplication has shown its true shape before extracting.

---

## KISS — Keep It Simple, Stupid

**Principle:** Systems work best when they are kept simple rather than made complex.

**Apply:**
- Favor clarity over cleverness
- Use straightforward solutions when possible
- Avoid over-engineering and speculative flexibility
- Write for the next human (or agent) who will read it

**Benefits:** Lower cognitive load, fewer bugs, faster debugging.

---

## SOLID Principles

### S — Single Responsibility Principle (SRP)

**Principle:** A class or module should have one, and only one, reason to change.

If a class has multiple responsibilities, split it. A responsibility is a reason to change — when two reasons live together, they pull the code in opposing directions.

```javascript
// BAD: Multiple responsibilities
class BookManager {
  saveBook() { /* database logic */ }
  validateBook() { /* validation logic */ }
  sendNotification() { /* email logic */ }
}

// GOOD: Separate responsibilities
class BookService { saveBook() {} }
class BookValidator { validateBook() {} }
class NotificationService { sendNotification() {} }
```

### O — Open/Closed Principle (OCP)

**Principle:** Software entities should be open for extension but closed for modification.

Design for extension via abstraction and polymorphism so new behavior can be added without editing tested, working code.

```javascript
// GOOD: Extend without modifying
class Discount {
  calculate(amount) { return amount; }
}

class StudentDiscount extends Discount {
  calculate(amount) { return amount * 0.9; }
}
```

### L — Liskov Substitution Principle (LSP)

**Principle:** Subclasses must be substitutable for their base class without breaking correctness.

Subclasses must honor the contract of their parent. Derived classes should *extend*, not contradict, base behavior.

```javascript
// BAD: Breaks substitution
class Bird { fly() { /* ... */ } }
class Penguin extends Bird {
  fly() { throw new Error("Can't fly!"); }
}

// GOOD: Model the actual hierarchy
class Bird { move() { /* ... */ } }
class FlyingBird extends Bird { move() { this.fly(); } }
class Penguin extends Bird { move() { this.swim(); } }
```

### I — Interface Segregation Principle (ISP)

**Principle:** Clients should not be forced to depend on interfaces they do not use.

Prefer focused, specific interfaces over large general ones. Classes should only implement methods they actually need.

```javascript
// BAD: Fat interface
interface Worker { work(); eat(); sleep(); }

// GOOD: Segregated interfaces
interface Workable { work(); }
interface Eatable { eat(); }
interface Sleepable { sleep(); }

class Robot implements Workable {}
class Human implements Workable, Eatable, Sleepable {}
```

### D — Dependency Inversion Principle (DIP)

**Principle:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

Depend on interfaces, not concrete implementations. Use dependency injection to manage dependencies — this is what makes code testable.

```javascript
// BAD: Depends on concrete class
class BookService {
  constructor() { this.database = new MySQLDatabase(); }
}

// GOOD: Depends on injected abstraction
class BookService {
  constructor(database) { this.database = database; }
}

const service = new BookService(new MySQLDatabase());
const testService = new BookService(new MockDatabase());
```

---

## Application Checklist

Before writing or reviewing code, ask:

1. **DRY** — Am I repeating myself? (And: is the duplication mature enough to abstract?)
2. **KISS** — Is this the simplest solution that works?
3. **SRP** — Does this do ONE thing?
4. **OCP** — Can I extend without modifying?
5. **LSP** — Can subtypes replace base types without surprises?
6. **ISP** — Are my interfaces focused?
7. **DIP** — Am I depending on abstractions?

---

## Red Flags

- Copy-pasted code blocks
- Functions over ~30 lines
- Classes with "and" in their name
- Deep inheritance hierarchies (more than 2 levels is usually wrong)
- Modifying working code to add a feature instead of extending it
- Giant interfaces that nobody fully implements
- Direct instantiation of dependencies inside constructors
- Names that describe *how* instead of *what*
