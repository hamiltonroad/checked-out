# Running Checked Out

Complete guide to get the Checked Out library management system running on your local machine with sample data.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ LTS ([download here](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **MySQL** 8+ ([download here](https://dev.mysql.com/downloads/mysql/))
- **Git** ([download here](https://git-scm.com/downloads))

Verify your installations:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
mysql --version   # Should show 8.x.x or higher
```

## Step 1: Clone the Repository

```bash
git clone https://github.com/hamiltonroad/checked-out.git
cd checked-out
```

## Step 2: Set Up the Database

### Create the Database

**Option A: Using the initialization script (recommended)**
```bash
mysql -u root -p < database/init.sql
```

**Option B: Create manually**
```bash
mysql -u root -p
```

Then in the MySQL prompt:
```sql
CREATE DATABASE checked_out CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE checked_out_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## Step 3: Install Dependencies

From the project root:
```bash
npm install
```

This uses npm workspaces to install both backend and frontend dependencies.

## Step 4: Configure Environment

### Backend

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` in your text editor and update with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=checked_out
PORT=3000
NODE_ENV=development
```

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

The default frontend configuration should work as-is. Verify `frontend/.env` contains:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Step 5: Set Up the Database Schema and Seed Data

### Run Database Migrations

This creates the database tables:
```bash
cd backend
npm run db:migrate
```

You should see output showing each migration being applied.

### Seed the Database with Sample Data

This populates the database with sample data:
```bash
npm run db:seed
```

The seeded data includes:
- 30+ books across various genres (fiction, non-fiction, science fiction, mystery)
- Author information and book-author relationships
- Physical and Kindle copies with different conditions
- Patron accounts with login credentials
- Sample checkout records showing books in circulation
- Sample ratings and reviews

## Step 6: Start the Application

### Option A: Automated Startup (Recommended)

From the project root directory:
```bash
./scripts/start-all.sh
```

This script will:
- Check if services are already running
- Start the backend server (http://localhost:3000)
- Start the frontend development server (http://localhost:5173)
- Display a status summary

**To stop all services later:**
```bash
./scripts/stop-all.sh
```

### Option B: Manual Startup

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for the message:
```
Server running on port 3000
Database connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for the message:
```
VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 7: Access the Application

Open your web browser and navigate to:

**Frontend Application:** http://localhost:5173

**Backend API Health Check:** http://localhost:3000/health

## What You Should See

With the seeded data, you should be able to:
- Browse the book catalog with search and availability filters
- Log in as a patron, librarian, or admin using seeded credentials
- View book details including ratings and reviews
- (As a librarian) Check out and return books, view overdue checkouts
- (As a patron) Join waitlists, manage wishlists, and submit ratings
- (As an admin) Search and view patron details with full history

## Verification

### Check Backend is Running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T..."
}
```

## Troubleshooting

### Database Connection Errors

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:** Check your MySQL password in `backend/.env` is correct

---

**Error:** `Unknown database 'checked_out'`

**Solution:** The database wasn't created. Run:
```bash
mysql -u root -p < database/init.sql
```

---

**Error:** `Client does not support authentication protocol`

**Solution:** Update MySQL user authentication:
```bash
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```

### Port Already in Use

**Error:** `Port 3000 is already in use` or `Port 5173 is already in use`

**Solution:** Either stop the other application using that port, or change the port:
- Backend: Edit `backend/.env` and change `PORT=3000` to another port
- Frontend: The Vite dev server will automatically try the next available port

### Migration Errors

**Error:** Migrations fail to run

**Solution:**
1. Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
2. Reset database:
```bash
cd backend
npm run db:migrate:undo
npm run db:migrate
```

### Seed Data Already Exists

**Error:** Seeding fails because data already exists

**Note:** Seeders can typically only be run once. If you need to re-seed:

1. Reset the database:
```bash
mysql -u root -p checked_out
DROP DATABASE checked_out;
CREATE DATABASE checked_out CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

2. Re-run migrations and seeds:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### Node Modules Issues

**Error:** `Cannot find module` errors

**Solution:** From the project root:
```bash
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

### Frontend Not Loading

**Issue:** Frontend shows blank page or errors

**Solution:**
1. Check browser console (F12) for errors
2. Verify backend is running at http://localhost:3000/health
3. Check `frontend/.env` has correct `VITE_API_BASE_URL`
4. Clear browser cache and reload

## Development Tips

### Viewing Logs

Logs are stored in the `logs/` directory:
- `logs/backend.log` - Backend server logs
- `logs/frontend.log` - Frontend build logs

### Database Commands

```bash
cd backend

# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Seed database
npm run db:seed
```

### Code Quality

```bash
# Run linters
cd backend && npm run lint
cd frontend && npm run lint

# Auto-format code
cd backend && npm run format
cd frontend && npm run format
```

### Running Tests

```bash
# Smoke tests (requires servers running)
npm run test:smoke

# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Next Steps

Now that your application is running:

1. **Explore the Interface** - Browse books, log in, try checking out a book
2. **Read the Documentation** - Check [README.md](README.md) for architecture details
3. **Review Standards** - See [standards/quick-ref/](standards/quick-ref/) for coding guidelines
4. **Start Developing** - Create new features or fix issues

## Additional Resources

- **Database Setup Details:** [database/README.md](database/README.md)
- **Script Documentation:** [scripts/README.md](scripts/README.md)
- **Frontend Standards:** [standards/quick-ref/frontend-quick-ref.md](standards/quick-ref/frontend-quick-ref.md)
- **Backend Standards:** [standards/quick-ref/backend-quick-ref.md](standards/quick-ref/backend-quick-ref.md)
- **Quick Start:** [QUICK_START.md](QUICK_START.md)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in the logs
3. Verify all prerequisites are correctly installed
4. Check that all environment variables are properly configured
5. Open an issue on GitHub with details about your problem

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See [LICENSE.txt](LICENSE.txt) for details.
