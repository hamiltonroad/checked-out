# Checked Out

A working 3-tier library management application built as a teaching tool for full-stack web development. This application was developed in approximately 8 hours to create a functional foundation demonstrating modern web technologies, best practices, and architectural patterns.

## About This Project

**Purpose**: This is an intentionally simplified but fully functional application designed for teaching and learning. It provides a real-world codebase where students and developers can:
- Study modern full-stack architecture patterns
- Practice adding new features to an existing codebase
- Learn from working code that follows industry standards
- Build upon a solid foundation with clear opportunities for extension

**Status**: The application currently implements core book browsing functionality with a complete backend infrastructure. Many features are intentionally left unimplemented to provide learning opportunities for students and developers.

## Current Features

### What Works Now
- **Browse Books**: View all books in a responsive interface (table on desktop, cards on mobile)
- **Search**: Real-time search across book titles and author names with debouncing
- **Filter**: Filter books by availability status (All Books, Available, Checked Out)
- **Book Details**: View detailed information about each book including authors, ISBN, publisher, publication year, and genre
- **Availability Tracking**: Automatic calculation of book availability based on physical and Kindle copies and checkout records
- **Responsive Design**: Mobile-optimized with bottom navigation and card layouts
- **Theme Toggle**: Switch between light and dark modes
- **Keyboard Navigation**: Search shortcuts (Cmd/Ctrl+K) and accessible navigation

### Database & Backend
- Complete relational database schema with 5 models:
  - **Books**: Core metadata (title, ISBN, publisher, publication year, genre)
  - **Authors**: Many-to-many relationships with books
  - **Copies**: Physical and Kindle format tracking
  - **Patrons**: Library cardholder information
  - **Checkouts**: Transaction history with checkout and return dates
- Two working API endpoints: `GET /api/v1/books` and `GET /api/v1/books/:id`
- Business logic for calculating book availability from copy and checkout records
- Seed data with 30+ books, authors, and sample checkout records

### What's Not Implemented Yet

The following features are **intentionally disabled or incomplete** to provide learning opportunities:

- **Patron Management**: Database models exist but no UI or API endpoints
- **Reports Dashboard**: Placeholder in navigation only
- **Book Management**: No create, update, or delete functionality
- **Checkout/Return Process**: Models exist but no workflow implementation
- **Authentication**: Passport.js and JWT configured but not implemented
- **Authorization**: No role-based access control
- **Advanced Filtering**: Backend supports genre filtering but frontend doesn't use it
- **Pagination**: All books loaded at once (limited to 100)
- **Image Upload**: Books show placeholder icons only
- **Overdue Tracking**: No overdue status calculation or notifications

## Learning Opportunities

This codebase provides excellent opportunities to:

1. **Add New Features**:
   - Implement patron management pages and API endpoints
   - Build the book checkout/return workflow
   - Add authentication and user accounts
   - Create a reports dashboard with analytics
   - Implement book management (add, edit, delete)

2. **Fix and Improve Tests**:
   - Add missing unit tests for services and controllers
   - Write integration tests for API endpoints
   - Add frontend component tests
   - Increase test coverage

3. **Enhance Existing Features**:
   - Add server-side pagination for better performance
   - Implement book cover image uploads
   - Add overdue book tracking and notifications
   - Create advanced search with multiple filters
   - Add data export functionality

4. **Code Quality**:
   - Refactor duplicated code
   - Improve error handling
   - Add API documentation with Swagger/OpenAPI
   - Optimize database queries
   - Add performance monitoring

## Tech Stack

### Frontend
- **React 18+** - UI framework with functional components and hooks
- **Vite 5+** - Fast build tool and dev server
- **Material UI v6** - Material Design 3 component library
- **React Router v7** - Client-side routing
- **TanStack Query v5** - Server state management and caching
- **Axios** - HTTP client

### Backend
- **Node.js 18+ LTS** - JavaScript runtime
- **Express 4+** - Web application framework
- **Sequelize 6+** - ORM for MySQL
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **Joi** - Request validation
- **Winston** - Structured logging

### Database
- **MySQL 8+** - Relational database

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest/Vitest** - Testing frameworks

## Architecture

This application follows a 3-tier architecture:

1. **Presentation Layer** (`/frontend`) - React SPA providing the user interface
2. **Application Layer** (`/backend`) - Node.js/Express REST API handling business logic
3. **Data Layer** (`/database`) - MySQL database for persistent data storage

## Project Structure

```
checked-out/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React Context providers
│   │   ├── services/     # API integration
│   │   ├── utils/        # Utility functions
│   │   └── theme/        # MUI theme configuration
│   └── package.json
│
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # HTTP request handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── middlewares/  # Custom middleware
│   │   ├── validators/   # Joi validation schemas
│   │   ├── utils/        # Utility functions
│   │   ├── migrations/   # Database migrations
│   │   └── seeders/      # Database seeders
│   └── package.json
│
├── database/             # Database setup and documentation
│   ├── README.md         # Database setup instructions
│   └── init.sql          # Database initialization script
│
└── standards/            # Project coding standards
    ├── quick-ref/        # Quick reference guides
    └── full/             # Detailed standards documentation

```

## Getting Started

### Prerequisites

- **Node.js** 18+ LTS
- **npm** 9+
- **MySQL** 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hamiltonroad/checked-out.git
   cd checked-out
   ```

2. **Set up the database**

   See [database/README.md](database/README.md) for detailed instructions.

   Quick setup:
   ```bash
   mysql -u root -p < database/init.sql
   ```

3. **Set up the backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   npm install
   npm run db:migrate
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   ```

### Running the Application

**Quick Start (Recommended):**

Use the helper scripts to start both services:
```bash
./scripts/start-all.sh
```

This will:
- Check if services are already running
- Install dependencies if needed
- Create `.env` files from examples
- Start backend on http://localhost:3000
- Start frontend on http://localhost:5173
- Show status summary

**Stop all services:**
```bash
./scripts/stop-all.sh
```

**Manual Start (Alternative):**

1. **Start the backend** (in `backend/` directory):
   ```bash
   npm run dev
   ```
   Backend runs on http://localhost:3000

2. **Start the frontend** (in `frontend/` directory):
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:5173

**Utility Scripts:**

See [scripts/README.md](scripts/README.md) for detailed documentation on:
- `start-all.sh` - Start both services
- `start-backend.sh` - Start backend only
- `start-frontend.sh` - Start frontend only
- `stop-all.sh` - Stop all services

**Production build:**

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Development

### Code Standards

This project follows strict coding standards. See [standards/](standards/) for details.

Quick references:
- [Frontend Standards](standards/quick-ref/frontend-quick-ref.md)
- [Backend Standards](standards/quick-ref/backend-quick-ref.md)
- [Craftsmanship Principles](standards/quick-ref/craftsmanship-quick-ref.md)
- [Tech Stack Details](standards/quick-ref/tech-stack-quick-ref.md)

### Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Linting and Formatting

```bash
# Frontend
cd frontend
npm run lint
npm run format

# Backend
cd backend
npm run lint
npm run format
```

## API Documentation

Base URL (development): `http://localhost:3000/api`

### Available Endpoints

**Health Check**
```
GET /health
```
Returns server health status.

**Books**
```
GET /api/v1/books
```
Get all books with authors and availability status.

Query Parameters:
- `genre` (optional): Filter by genre
- `limit` (optional, default: 100): Maximum number of results
- `offset` (optional, default: 0): Number of records to skip

Response: Array of book objects with authors array and calculated `status` field (either "available" or "checked_out").

```
GET /api/v1/books/:id
```
Get a single book by ID with full details.

Response: Book object with authors array and availability status.

### Planned Endpoints (Not Implemented)
- `POST /api/v1/books` - Create a new book
- `PUT /api/v1/books/:id` - Update a book
- `DELETE /api/v1/books/:id` - Delete a book
- `GET /api/v1/patrons` - List patrons
- `POST /api/v1/checkouts` - Check out a book
- `PUT /api/v1/checkouts/:id/return` - Return a book
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/register` - Register new user

## Contributing

1. Follow the coding standards in [standards/](standards/)
2. Write tests for new features
3. Ensure all tests pass before committing
4. Use conventional commit messages
5. Create feature branches for new work

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

See [LICENSE](LICENSE) for more details.
