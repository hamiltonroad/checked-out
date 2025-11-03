# Checked Out

A 3-tier web application for teaching purposes, demonstrating full-stack development with modern technologies.

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

API endpoints will be documented as they are developed.

Base URL (development): `http://localhost:3000/api`

Health check: `GET /health`

## Contributing

1. Follow the coding standards in [standards/](standards/)
2. Write tests for new features
3. Ensure all tests pass before committing
4. Use conventional commit messages
5. Create feature branches for new work

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

See [LICENSE](LICENSE) for more details.
