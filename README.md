# Checked Out

A working 3-tier library management application built as a teaching tool for full-stack web development. This application was developed iteratively to create a functional foundation demonstrating modern web technologies, best practices, and architectural patterns.

Check out my book about building AI harnesses like the one used in this application:
https://www.amazon.com/Harness-Engineering-Vibe-Coders-Crider/dp/B0GTMV3D3W/#

## About This Project

**Purpose**: This is an intentionally simplified but fully functional application designed for teaching and learning. It provides a real-world codebase where students and developers can:
- Study modern full-stack architecture patterns
- Practice adding new features to an existing codebase
- Learn from working code that follows industry standards
- Build upon a solid foundation with clear opportunities for extension

**Status**: The application implements a comprehensive library management system with book browsing, patron management, checkout/return workflows, waitlists, holds, wishlists, ratings and reviews, and role-based access control.

## Current Features

### Books
- Browse all books in a responsive interface (table on desktop, cards on mobile)
- Real-time search across book titles and author names with debouncing
- Filter books by availability status (All Books, Available, Checked Out)
- View detailed information about each book including authors, ISBN, publisher, publication year, and genre
- Automatic availability calculation based on physical/Kindle copies and checkout records
- Ratings and reviews with star ratings, review text, and rating statistics

### Authentication & Authorization
- Login with card number and password (JWT cookie-based sessions)
- Access/refresh token management with automatic rotation
- Role-based access control with three roles: patron, librarian, admin
- Protected routes enforcing role requirements on both frontend and backend

### Patron Management
- List and search patrons by name or card number (admin)
- View patron details with full checkout, hold, and waitlist history
- Patron status tracking (active, inactive, suspended)

### Checkout & Return Workflow
- Librarians can check out copies to patrons
- View current checkouts with due dates
- Return books with single-click workflow
- Overdue checkout tracking and display
- Full checkout history

### Waitlist & Holds
- Patrons can join a waitlist for unavailable books by format (physical/digital)
- View waitlist position in queue
- Automatic hold creation when a copy becomes available for the next patron in queue
- Leave waitlist functionality

### Wishlist
- Add/remove books from a personal wishlist
- View wishlist from patron profile

### Ratings & Reviews
- Submit 1-5 star ratings with optional review text
- View book ratings, reviews, and rating distribution
- Top-rated books endpoint
- Edit and delete own ratings

### UI/UX
- Responsive design with mobile bottom navigation and card layouts
- Light and dark theme toggle
- Keyboard navigation with search shortcuts (Cmd/Ctrl+K)
- Loading skeletons, empty states, and confirmation dialogs

### Database & Backend
- 10 Sequelize models: Books, Authors, Copies, Patrons, Checkouts, Ratings, Wishlists, WaitlistEntries, Holds, and the BookAuthor join table
- RESTful API with 11+ route files covering books, authors, copies, patrons, checkouts, waitlist, holds, wishlists, ratings, and auth
- Service-layer business logic with controller-layer HTTP handling
- Joi validation on all routes
- JWT authentication with HTTP-only cookies
- Rate limiting, structured logging (Winston), and comprehensive error handling
- Database migrations and seeders with 30+ books and sample data

### Testing
- Playwright E2E tests organized in three layers: smoke, flow, and security
- Smoke tests: app loading, login, book browsing, filtering, book details
- Flow tests: checkout/return workflow, waitlist operations, patron search
- Security tests: RBAC enforcement, protected route redirects, request validation
- Backend unit and integration tests

### What's Not Implemented Yet

The following features are **intentionally left incomplete** to provide learning opportunities:

- **Book Management CRUD**: No create, update, or delete functionality for books
- **Patron Registration**: Login exists but no self-signup workflow
- **Reports Dashboard**: Placeholder in navigation only
- **Book Cover Images**: Books show placeholder icons only
- **Notifications**: No email or push notifications for overdue books or hold availability
- **Data Export**: No CSV or report export functionality
- **Advanced Admin Features**: No admin UI for creating/editing patrons or books

## Learning Opportunities

This codebase provides excellent opportunities to:

1. **Add New Features**:
   - Build book management (add, edit, delete) with admin UI
   - Implement patron self-registration
   - Create a reports dashboard with analytics
   - Add book cover image uploads
   - Build an overdue notification system

2. **Enhance Existing Features**:
   - Add server-side pagination for book listings
   - Implement advanced search with multiple filters
   - Add data export functionality
   - Build email notifications for holds and overdue books

3. **Code Quality**:
   - Add API documentation with Swagger/OpenAPI
   - Improve test coverage
   - Add performance monitoring

## Tech Stack

### Frontend
- **React 18+** - UI framework with functional components and hooks
- **Vite 5+** - Fast build tool and dev server
- **Material UI v6** - Material Design 3 component library
- **React Router v7** - Client-side routing
- **TanStack Query v5** - Server state management and caching
- **Axios** - HTTP client
- **TypeScript** - Type-safe component development

### Backend
- **Node.js 18+ LTS** - JavaScript runtime
- **Express 4+** - Web application framework
- **Sequelize 6+** - ORM for MySQL
- **JWT** - Token-based authentication with HTTP-only cookies
- **Joi** - Request validation
- **Winston** - Structured logging

### Database
- **MySQL 8+** - Relational database

### Testing
- **Playwright** - End-to-end testing
- **Jest/Vitest** - Unit and integration testing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

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
│   │   ├── types/        # Shared TypeScript interfaces
│   │   ├── constants/    # Shared domain constants
│   │   ├── utils/        # Utility functions
│   │   └── theme/        # MUI theme configuration
│   ├── e2e/              # Playwright E2E tests
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
├── standards/            # Project coding standards
│   ├── quick-ref/        # Quick reference guides
│   └── full/             # Detailed standards documentation
│
└── scripts/              # Utility scripts
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

3. **Install all dependencies**
   ```bash
   npm install
   ```
   This uses npm workspaces to install both backend and frontend dependencies from the project root.

4. **Set up the backend**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   npm run db:migrate
   ```

5. **Set up the frontend**
   ```bash
   cp frontend/.env.example frontend/.env
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
# Smoke tests (requires servers running)
npm run test:smoke

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

## Contributing

1. Follow the coding standards in [standards/](standards/)
2. Write tests for new features
3. Ensure all tests pass before committing
4. Use conventional commit messages
5. Create feature branches for new work

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

See [LICENSE.txt](LICENSE.txt) for more details.
