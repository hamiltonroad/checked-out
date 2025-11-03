# Backend Quick Reference

Node.js + Express + MySQL + Sequelize

---

## Project Structure

```
src/
├── config/         # Database, logger, env config
├── controllers/    # HTTP handlers (thin layer)
├── services/       # Business logic
├── models/         # Sequelize models
├── routes/         # Route definitions
├── middlewares/    # Error handling, auth, validation
├── validators/     # Joi schemas
├── utils/          # ApiError, ApiResponse, constants
├── migrations/     # Database migrations
└── seeders/        # Database seeds
```

**Key Principle:** Controllers handle HTTP, Services contain business logic.

---

## Naming Conventions

- Variables/functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Classes: `PascalCase`
- Private functions: `_prefixWithUnderscore`
- Booleans: `isActive`, `hasPermission`, `shouldValidate`
- URLs: `kebab-case` (`/api/v1/library-members`)

---

## Core Patterns

### Controllers (HTTP Layer)
```javascript
// controllers/bookController.js
class BookController {
  async getAllBooks(req, res, next) {
    try {
      const result = await bookService.getAllBooks(req.query);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }
}
```

### Services (Business Logic)
```javascript
// services/bookService.js
const { Book } = require('../models');

class BookService {
  async getAllBooks(filters = {}) {
    const where = {};
    if (filters.genre) where.genre = filters.genre;

    return Book.findAll({
      where,
      limit: parseInt(filters.limit, 10) || 10,
      order: [['title', 'ASC']],
    });
  }
}
```

### Routes
```javascript
// routes/bookRoutes.js
router.get('/', validateRequest(bookValidator.getAll), bookController.getAllBooks);
router.post('/', authenticate, validateRequest(bookValidator.create), bookController.createBook);
```

---

## Error Handling

```javascript
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }

  static notFound(msg) { return new ApiError(404, msg); }
  static badRequest(msg) { return new ApiError(400, msg); }
  static conflict(msg) { return new ApiError(409, msg); }
}

// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

---

## Validation

```javascript
// validators/bookValidator.js
const Joi = require('joi');

const bookValidator = {
  create: {
    body: Joi.object({
      title: Joi.string().min(1).max(255).required(),
      author: Joi.string().required(),
      isbn: Joi.string().pattern(/^[0-9]{10,13}$/).required(),
      genre: Joi.string().required(),
    }),
  },
};
```

---

## Database (Sequelize)

### Model Definition
```javascript
// models/Book.js
module.exports = (sequelize) => {
  return sequelize.define('Book', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    isbn: { type: DataTypes.STRING(13), unique: true },
    genre: { type: DataTypes.ENUM('Fiction', 'Non-Fiction', 'Science') },
    status: { type: DataTypes.ENUM('available', 'checked-out'), defaultValue: 'available' },
  }, {
    tableName: 'books',
    timestamps: true,
    indexes: [{ fields: ['isbn'] }],
  });
};
```

### Common Operations
```javascript
// Find
const book = await Book.findByPk(id);
const books = await Book.findAll({ where: { status: 'available' } });

// Create
const book = await Book.create({ title, author, isbn });

// Update
await book.update({ status: 'checked-out' });
await Book.update({ status }, { where: { id } });

// Delete
await book.destroy();
```

---

## Security

```javascript
// app.js
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '10mb' }));
```

---

## Best Practices

### DO ✅
- **Always use async/await** (never callbacks or `.then()`)
- **Controllers**: Extract request data, call services, return responses only
- **Services**: Contain all business logic and database operations
- **Validate all inputs** with Joi
- **Keep functions under 30 lines**, single responsibility
- **Use custom ApiError** for all errors
- **Use transactions** for multi-step database operations
- **Log with Winston** (never `console.log`)

### DON'T ❌
- Put business logic in controllers
- Use `.then()` or callbacks
- Skip input validation
- Write raw SQL (use Sequelize)
- Commit `.env` files
- Expose stack traces in production
- Modify schema without migrations
