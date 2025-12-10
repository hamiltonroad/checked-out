# Enterprise Patterns Quick Reference

**Purpose:** Checklist of common enterprise software patterns to consider for every feature. Agents and developers must explicitly address each pattern during planning.

---

## How to Use This Checklist

During the planning phase, review each pattern and document:
- **Applies**: How this pattern applies to the current feature
- **Not Applicable**: Why this pattern doesn't apply (with brief justification)

Never skip a pattern without explicit consideration.

---

## Pattern Checklist

### 1. Input Validation (Frontend + Backend Symmetry)

**Rule:** Every validation on the frontend MUST also exist on the backend.

**Why:**
- Frontend validation is for UX (immediate feedback)
- Backend validation is for security (bad actors bypass frontend)
- Both are required for audit compliance

**Consider:**
- [ ] Required fields validated on FE and BE
- [ ] Format validation (email, phone, dates) on FE and BE
- [ ] Length limits enforced on FE and BE
- [ ] Allowed values/enums validated on FE and BE
- [ ] Error messages are user-friendly (don't leak internals)

**Example:**
```javascript
// Frontend: immediate feedback
if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  setError('Please enter a valid email address');
}

// Backend: security enforcement (same rule)
const schema = Joi.object({
  email: Joi.string().email().required()
});
```

---

### 2. State Transitions

**Rule:** Define valid state transitions explicitly. Reject invalid transitions.

**Why:**
- Prevents data corruption (can't return a book that's not checked out)
- Business rules encoded in code, not just UI
- Audit trail shows valid progression

**Consider:**
- [ ] What states can this entity be in?
- [ ] What transitions are valid from each state?
- [ ] Who can trigger each transition? (permissions)
- [ ] What happens on invalid transition attempt?
- [ ] Is the current state checked before transition?

**Example:**
```javascript
// Valid transitions for a book checkout
const validTransitions = {
  'available': ['checked_out', 'reserved'],
  'checked_out': ['returned', 'overdue'],
  'reserved': ['checked_out', 'cancelled'],
  'overdue': ['returned'],
  'returned': ['available']
};

function canTransition(currentState, newState) {
  return validTransitions[currentState]?.includes(newState);
}
```

---

### 3. Referential Integrity

**Rule:** Understand what depends on this entity and what this entity depends on.

**Why:**
- Prevents orphaned records
- Maintains data consistency
- Cascading effects must be intentional

**Consider:**
- [ ] What happens if this entity is deleted?
- [ ] What must exist before this entity can be created?
- [ ] Are there cascade delete rules? Should there be?
- [ ] Are there soft deletes instead of hard deletes?
- [ ] What error message if integrity would be violated?

**Example:**
```javascript
// Before deleting an author
const booksCount = await Book.count({ where: { authorId } });
if (booksCount > 0) {
  throw new ApiError(400,
    `Cannot delete author with ${booksCount} books. Reassign or delete books first.`
  );
}
```

---

### 4. Concurrency

**Rule:** Consider what happens when two users act simultaneously.

**Why:**
- Race conditions cause data corruption
- Last-write-wins may not be acceptable
- Users need clear feedback on conflicts

**Consider:**
- [ ] Can two users modify the same record simultaneously?
- [ ] Is optimistic locking needed (version field)?
- [ ] Is pessimistic locking needed (SELECT FOR UPDATE)?
- [ ] What's the user experience on conflict?
- [ ] Are counters/quantities atomic operations?

**Example:**
```javascript
// Optimistic locking with version field
const book = await Book.findByPk(id);
const [updated] = await Book.update(
  { title: newTitle, version: book.version + 1 },
  { where: { id, version: book.version } }
);
if (updated === 0) {
  throw new ApiError(409, 'Book was modified by another user. Please refresh and try again.');
}
```

---

### 5. Permissions

**Rule:** Every action must check if the current user is allowed to perform it.

**Why:**
- Security requirement
- Audit compliance
- Different users have different capabilities

**Consider:**
- [ ] Who can perform this action? (roles)
- [ ] Can users only see/modify their own data?
- [ ] Are there resource-level permissions (owner vs admin)?
- [ ] Is permission checked in backend, not just hidden in UI?
- [ ] What error for unauthorized access? (403 vs 404)

**Example:**
```javascript
// Check ownership before allowing modification
async function updateCheckout(checkoutId, updates, currentUser) {
  const checkout = await Checkout.findByPk(checkoutId);

  if (!checkout) {
    throw new ApiError(404, 'Checkout not found');
  }

  // Users can only modify their own checkouts (unless admin)
  if (checkout.patronId !== currentUser.id && !currentUser.isAdmin) {
    throw new ApiError(403, 'Not authorized to modify this checkout');
  }

  return checkout.update(updates);
}
```

---

### 6. Audit Trail

**Rule:** Significant state changes should be logged with who/when/what.

**Why:**
- Compliance requirements
- Debugging production issues
- Understanding user behavior

**Consider:**
- [ ] What actions need to be logged?
- [ ] Is `createdAt`/`updatedAt` sufficient or need explicit log?
- [ ] Should log who made the change? (`createdBy`/`updatedBy`)
- [ ] Are there legal retention requirements?
- [ ] Is PII handled appropriately in logs?

**Example:**
```javascript
// Audit log for checkout action
await AuditLog.create({
  action: 'BOOK_CHECKOUT',
  entityType: 'Checkout',
  entityId: checkout.id,
  userId: currentUser.id,
  details: { bookId, patronId, dueDate },
  timestamp: new Date()
});
```

---

### 7. Error Handling

**Rule:** Errors should be informative to users but not leak internals.

**Why:**
- Good UX requires helpful error messages
- Security requires hiding implementation details
- Debugging requires detailed server-side logs

**Consider:**
- [ ] User-facing message is helpful and actionable
- [ ] Technical details logged server-side only
- [ ] No stack traces in API responses
- [ ] No database column names in error messages
- [ ] Consistent error response format

**Example:**
```javascript
// User sees: "Email already registered. Try logging in or use a different email."
// Log shows: "Duplicate key violation on users.email: john@example.com"

try {
  await User.create(userData);
} catch (error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    logger.warn('Duplicate email registration attempt', { email: userData.email });
    throw new ApiError(400, 'Email already registered. Try logging in or use a different email.');
  }
  throw error;
}
```

---

### 8. Idempotency

**Rule:** Repeated identical requests should produce the same result.

**Why:**
- Network retries shouldn't create duplicates
- User double-clicks shouldn't cause problems
- API reliability

**Consider:**
- [ ] What happens if this endpoint is called twice?
- [ ] Are unique constraints in place to prevent duplicates?
- [ ] Should there be an idempotency key for mutations?
- [ ] Is the response the same on duplicate request?

**Example:**
```javascript
// Idempotent reservation - same patron can't reserve same book twice
const existing = await Reservation.findOne({
  where: { patronId, bookId, status: 'active' }
});

if (existing) {
  return existing; // Return existing instead of creating duplicate
}

return Reservation.create({ patronId, bookId, status: 'active' });
```

---

### 9. Pagination & Limits

**Rule:** List endpoints must have reasonable limits.

**Why:**
- Prevents memory exhaustion
- Improves response times
- Better UX with manageable data sets

**Consider:**
- [ ] Is there a default page size?
- [ ] Is there a maximum page size?
- [ ] Is total count provided for pagination UI?
- [ ] Are large exports handled differently (async job)?

**Example:**
```javascript
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

async function getBooks(query) {
  const limit = Math.min(query.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = query.page ? (query.page - 1) * limit : 0;

  const { rows, count } = await Book.findAndCountAll({ limit, offset });

  return {
    data: rows,
    pagination: {
      total: count,
      page: query.page || 1,
      limit,
      pages: Math.ceil(count / limit)
    }
  };
}
```

---

### 10. Sensitive Data

**Rule:** Identify and protect sensitive data.

**Why:**
- Privacy regulations (GDPR, CCPA)
- Security best practices
- User trust

**Consider:**
- [ ] Is any PII involved? (name, email, address, phone)
- [ ] Are passwords hashed (never stored plain)?
- [ ] Is sensitive data excluded from logs?
- [ ] Is sensitive data excluded from API responses unless needed?
- [ ] Are there data retention policies?

**Example:**
```javascript
// Exclude sensitive fields from API response
const patron = await Patron.findByPk(id, {
  attributes: { exclude: ['passwordHash', 'ssn', 'dateOfBirth'] }
});

// Never log sensitive data
logger.info('Patron login', { patronId: patron.id }); // NOT { email, password }
```

---

## Quick Checklist Format

For planning documents, use this condensed format:

```markdown
## Enterprise Patterns Addressed

| Pattern | Applicable? | How Addressed |
|---------|-------------|---------------|
| Validation (FE+BE) | Yes | Email, phone validated both layers |
| State Transitions | Yes | checkout → returned → available |
| Referential Integrity | Yes | Can't delete patron with active checkouts |
| Concurrency | No | Single-user action, no race condition |
| Permissions | Yes | Patrons see only own checkouts |
| Audit Trail | Yes | Using createdAt/updatedAt |
| Error Handling | Yes | ApiError with user-friendly messages |
| Idempotency | Yes | Unique constraint on patron+book+date |
| Pagination | N/A | Single record endpoint |
| Sensitive Data | Yes | Password excluded from response |
```

---

**Last updated:** 2024-12-09
**For:** Agents and developers implementing features
