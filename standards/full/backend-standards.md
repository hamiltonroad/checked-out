# Backend Development Standards

## Overview

Standards for backend development in the "Checked Out" library management system using Node.js, Express, and MySQL.

---

## Project Structure

Use a **feature-based structure** that groups related functionality:

```
backend/
├── src/
│   ├── config/              # Configuration (database, logger, env)
│   ├── controllers/         # HTTP request handlers (thin layer)
│   ├── services/            # Business logic
│   ├── models/              # Sequelize models
│   ├── routes/              # Route definitions
│   ├── middlewares/         # Custom middleware
│   ├── validators/          # Request validation schemas
│   ├── utils/               # Utility functions and helpers
│   ├── migrations/          # Database migrations
│   ├── seeders/             # Database seeders
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
├── tests/
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── .env.example
├── .eslintrc.json
├── .prettierrc
└── package.json
```

### Folder Responsibilities

- **`/controllers/`**: HTTP layer only - extract request data, call services, return responses. No business logic.
- **`/services/`**: Business logic layer - validate rules, interact with database, return data or throw errors.
- **`/models/`**: Sequelize model definitions - database structure, associations, and validations.
- **`/routes/`**: Route definitions - map HTTP methods to controllers, apply middleware.
- **`/middlewares/`**: Reusable Express middleware - error handling, authentication, validation, logging.
- **`/validators/`**: Joi schemas for validating request body, params, and query.
- **`/utils/`**: Pure utility functions - custom error classes, response wrappers, constants.

---

## Coding Conventions

### Naming

```javascript
// Variables and functions: camelCase
const bookTitle = 'Clean Code';
const getUserById = (id) => { /* ... */ };

// Constants: UPPER_SNAKE_CASE
const MAX_CHECKOUT_DAYS = 14;

// Classes: PascalCase
class BookService { }

// Private functions: prefix with underscore
const _validateBookStatus = (status) => { /* ... */ };

// Boolean variables: is/has/should prefix
const isAvailable = true;
const hasActiveCheckouts = false;

// Files: camelCase for utilities, PascalCase for classes
// bookService.js, memberController.js

// Routes: kebab-case in URLs
// /api/v1/books
// /api/v1/library-members
```

### Functions

**Single Responsibility Principle:**
- Each function does ONE thing
- Maximum ~20-30 lines
- If comments needed to explain sections, split the function

```javascript
// ✅ GOOD: Focused, single-responsibility functions
const validateMemberForCheckout = async (memberId) => {
  const member = await Member.findByPk(memberId);
  if (!member) throw ApiError.notFound('Member not found');
  if (member.hasFines) throw ApiError.badRequest('Member has outstanding fines');
  return member;
};

const processCheckout = async (memberId, bookId) => {
  const member = await validateMemberForCheckout(memberId);
  await validateBookForCheckout(bookId);

  const checkout = await createCheckoutRecord(memberId, bookId);
  await updateBookStatus(bookId, 'checked-out');

  return checkout;
};
```

### Async/Await

**Always use async/await** - never callbacks or raw `.then()` chains.

```javascript
// ✅ GOOD
const getBookById = async (id) => {
  const book = await Book.findByPk(id);
  if (!book) throw ApiError.notFound('Book not found');
  return book;
};

// ✅ GOOD: Parallel operations
const getBooksAndMembers = async () => {
  const [books, members] = await Promise.all([
    Book.findAll(),
    Member.findAll(),
  ]);
  return { books, members };
};

// ❌ BAD: Using .then()
const getBookById = (id) => {
  return Book.findByPk(id)
    .then(book => {
      if (!book) throw new Error('Not found');
      return book;
    });
};
```

---

## Architecture Patterns

### Controllers vs Services

**Controllers** (HTTP layer):
- Extract data from request (params, query, body)
- Call service methods
- Return standardized responses
- **No business logic or database access**

**Services** (Business logic):
- Implement business rules
- Interact with database via Sequelize models
- Validate business constraints
- Independent of HTTP (testable without Express)

```javascript
// controllers/bookController.js
class BookController {
  async getAllBooks(req, res, next) {
    try {
      const filters = {
        genre: req.query.genre,
        status: req.query.status,
        limit: req.query.limit,
      };

      const result = await bookService.getAllBooks(filters);
      res.json(ApiResponse.success(result, 'Books retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

// services/bookService.js
const { Book } = require('../models');

class BookService {
  async getAllBooks(filters = {}) {
    const { genre, status, limit = 10 } = filters;

    const where = {};
    if (genre) where.genre = genre;
    if (status) where.status = status;

    const books = await Book.findAll({
      where,
      limit: parseInt(limit, 10),
      order: [['title', 'ASC']],
    });

    return books;
  }
}
```

### Routing

Use Express Router with RESTful conventions:

```javascript
// routes/bookRoutes.js
const express = require('express');
const bookController = require('../controllers/bookController');
const { validateRequest } = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/authenticate');
const bookValidator = require('../validators/bookValidator');

const router = express.Router();

router.get('/', validateRequest(bookValidator.getAll), bookController.getAllBooks);
router.get('/:id', validateRequest(bookValidator.getById), bookController.getBookById);
router.post('/', authenticate, validateRequest(bookValidator.create), bookController.createBook);
router.put('/:id', authenticate, validateRequest(bookValidator.update), bookController.updateBook);
router.delete('/:id', authenticate, validateRequest(bookValidator.delete), bookController.deleteBook);

module.exports = router;
```

**HTTP Verb Mapping:**

| Method | Purpose | URL | Controller Method |
|--------|---------|-----|-------------------|
| GET | Retrieve resources | `/books` | `getAllBooks()` |
| GET | Retrieve single | `/books/:id` | `getBookById()` |
| POST | Create | `/books` | `createBook()` |
| PUT | Update | `/books/:id` | `updateBook()` |
| DELETE | Delete | `/books/:id` | `deleteBook()` |

---

## Error Handling

### Custom Error Class

```javascript
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request') {
    return new ApiError(400, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
```

### Centralized Error Handler

```javascript
// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log errors
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
```

---

## Security & Validation

### Input Validation

Use Joi for request validation:

```javascript
// validators/bookValidator.js
const Joi = require('joi');

const bookValidator = {
  getAll: {
    query: Joi.object({
      genre: Joi.string().valid('Fiction', 'Non-Fiction', 'Science'),
      status: Joi.string().valid('available', 'checked-out'),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },

  create: {
    body: Joi.object({
      title: Joi.string().min(1).max(255).required(),
      author: Joi.string().min(1).max(255).required(),
      isbn: Joi.string().pattern(/^[0-9]{10,13}$/).required(),
      genre: Joi.string().required(),
    }),
  },
};

module.exports = bookValidator;
```

### Security Middleware

```javascript
// app.js
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CORS_ORIGIN }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
app.use('/api', limiter);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
```

---

## Database (Sequelize)

### Model Definition

```javascript
// models/Book.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title cannot be empty' },
      },
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING(13),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[0-9]{10,13}$/,
      },
    },
    genre: {
      type: DataTypes.ENUM('Fiction', 'Non-Fiction', 'Science', 'History'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'checked-out', 'maintenance'),
      defaultValue: 'available',
    },
  }, {
    tableName: 'books',
    timestamps: true,
    indexes: [
      { fields: ['isbn'] },
      { fields: ['status'] },
    ],
  });

  return Book;
};
```

### Database Operations

```javascript
// services/bookService.js
const { Book, Checkout } = require('../models');

class BookService {
  async createBook(bookData) {
    // Check for duplicate ISBN
    const existing = await Book.findOne({
      where: { isbn: bookData.isbn },
    });

    if (existing) {
      throw ApiError.conflict('Book with this ISBN already exists');
    }

    return Book.create(bookData);
  }

  async deleteBook(id) {
    const book = await Book.findByPk(id, {
      include: [{ model: Checkout, as: 'checkouts' }],
    });

    if (!book) {
      throw ApiError.notFound('Book not found');
    }

    const activeCheckouts = book.checkouts.filter(c => !c.returnDate).length;
    if (activeCheckouts > 0) {
      throw ApiError.badRequest('Cannot delete book with active checkouts');
    }

    await book.destroy();
  }
}
```

---

## Testing

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
```

### Unit Test Example

```javascript
// tests/unit/services/bookService.test.js
describe('BookService', () => {
  describe('createBook', () => {
    it('should create a new book', async () => {
      const bookData = {
        title: 'New Book',
        author: 'Author',
        isbn: '1234567890',
        genre: 'FICTION',
      };

      const book = await bookService.createBook(bookData);

      expect(book).toHaveProperty('id');
      expect(book.title).toBe('New Book');
    });

    it('should throw error for duplicate ISBN', async () => {
      const bookData = { title: 'Book', isbn: '1234567890', genre: 'FICTION' };
      await bookService.createBook(bookData);

      await expect(bookService.createBook(bookData))
        .rejects.toThrow('ISBN already exists');
    });
  });
});
```

---

## Logging

Use Winston for structured logging:

```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
```

---

## Best Practices

### DO ✅

- Separate controllers (HTTP) from services (business logic)
- Use async/await consistently
- Validate all inputs with Joi
- Use Sequelize for all database operations
- Keep functions focused and under 30 lines
- Log errors appropriately
- Write tests for services and routes
- Use environment variables for configuration
- Implement rate limiting and security headers
- Use transactions for multi-step database operations

### DON'T ❌

- Write business logic in controllers
- Use callbacks or `.then()` chains
- Skip input validation
- Write raw SQL queries
- Commit `.env` files
- Expose sensitive data in error responses
- Use `console.log` (use logger instead)
- Ignore linting errors
- Skip writing tests
- Modify database schema without migrations
