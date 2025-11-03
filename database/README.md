# Database Setup

MySQL 8+ database for the Checked Out application.

## Prerequisites

- MySQL 8+ installed and running
- MySQL user with database creation privileges

## Setup Instructions

### 1. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE checked_out CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE checked_out_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Create Database User (Optional but Recommended)

```sql
CREATE USER 'checked_out_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON checked_out.* TO 'checked_out_user'@'localhost';
GRANT ALL PRIVILEGES ON checked_out_test.* TO 'checked_out_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Backend Environment

Copy the `.env.example` file in the backend directory to `.env` and update database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=checked_out
DB_USER=checked_out_user
DB_PASSWORD=your_password_here
```

### 4. Run Migrations

From the backend directory:

```bash
npm run db:migrate
```

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

## Database Management

### Run Migrations

```bash
cd backend
npm run db:migrate
```

### Undo Last Migration

```bash
npm run db:migrate:undo
```

### Create New Migration

```bash
npx sequelize-cli migration:generate --name migration-name
```

### Create New Seeder

```bash
npx sequelize-cli seed:generate --name seeder-name
```

## Connection Testing

Test the database connection:

```bash
cd backend
node -e "const db = require('./src/models'); db.sequelize.authenticate().then(() => console.log('✅ Database connected')).catch(err => console.error('❌ Database connection failed:', err));"
```

## Troubleshooting

### Connection Refused

- Ensure MySQL is running: `mysql.server status` (macOS) or `sudo systemctl status mysql` (Linux)
- Check MySQL port: default is 3306
- Verify credentials in `.env` file

### Authentication Plugin Error

If you see "ER_NOT_SUPPORTED_AUTH_MODE", update the MySQL user:

```sql
ALTER USER 'checked_out_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;
```

### Migration Errors

Reset and rerun migrations (⚠️ DESTRUCTIVE - drops all tables):

```bash
npm run db:migrate:undo:all
npm run db:migrate
```
