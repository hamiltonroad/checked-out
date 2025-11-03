# Code Craftsmanship Quick Reference

Core principles for writing maintainable, professional code.

---

## DRY - Don't Repeat Yourself

**Rule:** Every piece of knowledge has ONE representation in the system.

**Apply:**
- Extract repeated code into functions/modules
- Use abstraction to eliminate redundancy
- Change once, apply everywhere

---

## KISS - Keep It Simple, Stupid

**Rule:** Simple solutions beat clever ones.

**Apply:**
- Favor clarity over cleverness
- Use straightforward solutions
- Avoid over-engineering
- Write for humans first

---

## SOLID Principles

### S - Single Responsibility
**One class, one job, one reason to change**

```javascript
// ❌ BAD: Multiple responsibilities
class BookManager {
  saveBook() { /* database logic */ }
  validateBook() { /* validation logic */ }
  sendNotification() { /* email logic */ }
}

// ✅ GOOD: Separate responsibilities
class BookService { saveBook() {} }
class BookValidator { validateBook() {} }
class NotificationService { sendNotification() {} }
```

### O - Open/Closed
**Open for extension, closed for modification**

```javascript
// ✅ GOOD: Extend without modifying
class Discount {
  calculate(amount) { return amount; }
}

class StudentDiscount extends Discount {
  calculate(amount) { return amount * 0.9; }
}

class SeniorDiscount extends Discount {
  calculate(amount) { return amount * 0.85; }
}
```

### L - Liskov Substitution
**Subclasses must be substitutable for their base class**

```javascript
// ❌ BAD: Breaks substitution
class Bird {
  fly() { /* flying logic */ }
}

class Penguin extends Bird {
  fly() { throw new Error("Can't fly!"); } // Breaks contract
}

// ✅ GOOD: Proper substitution
class Bird {
  move() { /* movement logic */ }
}

class FlyingBird extends Bird {
  move() { this.fly(); }
}

class Penguin extends Bird {
  move() { this.swim(); }
}
```

### I - Interface Segregation
**Don't force clients to depend on unused methods**

```javascript
// ❌ BAD: Fat interface
interface Worker {
  work();
  eat();
  sleep();
}

// ✅ GOOD: Segregated interfaces
interface Workable { work(); }
interface Eatable { eat(); }
interface Sleepable { sleep(); }

// Implement only what's needed
class Robot implements Workable { work() {} }
class Human implements Workable, Eatable, Sleepable {}
```

### D - Dependency Inversion
**Depend on abstractions, not concrete implementations**

```javascript
// ❌ BAD: Depends on concrete class
class BookService {
  constructor() {
    this.database = new MySQLDatabase(); // Tight coupling
  }
}

// ✅ GOOD: Depends on abstraction
class BookService {
  constructor(database) {
    this.database = database; // Injected dependency
  }
}

// Can use any database implementation
const service = new BookService(new MySQLDatabase());
const testService = new BookService(new MockDatabase());
```

---

## Quick Application Guide

**Before writing code, ask:**
1. **DRY**: Am I repeating myself?
2. **KISS**: Is this the simplest solution?
3. **SRP**: Does this do ONE thing?
4. **OCP**: Can I extend without modifying?
5. **LSP**: Can subtypes replace base types?
6. **ISP**: Are my interfaces focused?
7. **DIP**: Am I depending on abstractions?

**Red flags:**
- Copy-pasted code blocks
- Functions > 30 lines
- Classes with "and" in their name
- Deep inheritance hierarchies
- Modifying working code to add features
- Giant interfaces nobody fully implements
- Direct instantiation of dependencies
