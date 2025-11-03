# Tech Stack Quick Reference

"Checked Out" Library Management System

---

## Frontend

**Core**
- React 18.3+ (functional components, hooks)
- Vite 5.2+ (build tool, dev server)
- JavaScript ES6+ (optional TypeScript migration path)

**UI**
- Material UI v6 (Material Design 3)
- Emotion (CSS-in-JS)

**Routing**
- React Router v7 (data APIs, nested routes)

**State**
- TanStack Query v5 (server state, caching)
- React Context (auth, theme, preferences)
- useState (local state)

**HTTP**
- Axios 1.6+ (interceptors, auto JSON)

**Quality**
- ESLint 8+ (Airbnb config)
- Prettier 3+
- Husky 9+ (git hooks)
- lint-staged 15+

**Testing**
- Jest 29+
- React Testing Library 15+
- @testing-library/user-event

---

## Backend

**Runtime**
- Node.js 18+ LTS

**Framework**
- Express.js 4+

**Database**
- MySQL 8+
- Sequelize 6+ (ORM, migrations)

**Auth**
- Passport.js (strategies)
- JWT (tokens)
- bcrypt (password hashing)

**Validation**
- Joi (request validation)

**Security**
- helmet (security headers)
- express-rate-limit (rate limiting)
- cors (CORS middleware)

**Logging**
- Winston (structured logging)
- Morgan (HTTP request logger)

**Environment**
- dotenv (env vars)

**Quality**
- ESLint 8+ (Airbnb config)
- Prettier 3+
- Husky 9+
- lint-staged 15+

**Testing**
- Jest 29+
- Supertest (HTTP assertions)

---

## Development Tools

**Package Manager**
- npm 9+

**Version Control**
- Git + GitHub

**Editor**
- .editorconfig (consistent styles)

---

## Deployment Options

**Frontend Hosting**
- Vercel (zero config, optimized for Vite)
- Netlify (CDN, auto-deployments)
- AWS S3 + CloudFront

**Backend Hosting**
- Railway (simple Node.js + PostgreSQL)
- Render (free tier, auto-deploy)
- AWS EC2/ECS

**Database Hosting**
- Railway (included MySQL)
- PlanetScale (MySQL-compatible)
- AWS RDS

---

## Key Rationale

- **Modern & Stable:** Mature, actively maintained tools
- **Developer Experience:** Fast builds (Vite), great error messages (React Query)
- **Production Ready:** Battle-tested, used by major companies
- **Learning Curve:** Reasonable for JavaScript developers
- **Flexibility:** Can migrate to TypeScript, swap libraries without major rewrites
- **Cost:** Free and open-source, deployment free tiers available
