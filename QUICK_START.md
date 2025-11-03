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

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=checked_out
```

Install and start:
```bash
npm install
npm run dev
```

✅ Backend running at http://localhost:3000

## 3. Frontend Setup

In a new terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

✅ Frontend running at http://localhost:5173

## Verify Setup

1. Backend health check: http://localhost:3000/health
2. Frontend app: http://localhost:5173

## Next Steps

- Review [coding standards](standards/quick-ref/)
- Check [full README](README.md) for detailed documentation
- Create your first user story/issue
- Start building features!

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
