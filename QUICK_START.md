# Quick Start Guide

Get the Checked Out application running in 5 minutes.

## Prerequisites

Ensure you have these installed:
- Node.js 18+ LTS
- npm 9+
- MySQL 8+

## 1. Database Setup

```bash
# Create databases
mysql -u root -p < database/init.sql

# Or manually:
mysql -u root -p
CREATE DATABASE checked_out;
CREATE DATABASE checked_out_test;
EXIT;
```

## 2. Install Dependencies

From the project root:
```bash
npm install
```

## 3. Configure Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=checked_out
```

## 4. Migrate and Seed

```bash
cd backend
npm run db:migrate
npm run db:seed
```

## 5. Start the Application

**Option A: Automated (recommended)**
```bash
./scripts/start-all.sh
```

**Option B: Manual**

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## Verify Setup

1. Backend health check: http://localhost:3000/health
2. Frontend app: http://localhost:5173

You should see the book catalog. Log in with seeded patron credentials to access checkout, waitlist, wishlist, and rating features.

## Stop Services

```bash
./scripts/stop-all.sh
```

## Next Steps

- Review [coding standards](standards/quick-ref/)
- Check [full README](README.md) for detailed documentation
- See [RUNNING.md](RUNNING.md) for troubleshooting

## Troubleshooting

**Backend won't start:**
- Check MySQL is running
- Verify `.env` database credentials
- Check port 3000 is not in use

**Frontend won't start:**
- Check port 5173 is not in use
- Verify all npm dependencies installed

**Database connection failed:**
- Verify MySQL is running: `mysql.server status` (macOS)
- Check database exists: `SHOW DATABASES;`
- Verify credentials in `backend/.env`
