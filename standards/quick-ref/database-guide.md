# Database Guide

**IMPORTANT:** Claude can query the MySQL database using Sequelize via Node.js one-liners.

## How to Query Database

**Recommended method (uses project .env config):**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.query('SELECT COUNT(*) as count FROM books')
  .then(([results]) => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => console.error('Error:', err.message))
  .finally(() => process.exit(0));
"
```

**Why this works:**
- Uses existing `.env` configuration (no password in commands)
- Full access to Sequelize ORM
- Can execute any SQL query
- Returns JSON results

## Common Database Queries

**Check if database exists:**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Error:', err.message))
  .finally(() => process.exit(0));
"
```

**Get table counts:**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.query('SHOW TABLES')
  .then(([tables]) => {
    console.log('Tables:', tables);
    return Promise.all(
      tables.map(t => {
        const tableName = t['Tables_in_checked_out'];
        return db.sequelize.query(\`SELECT COUNT(*) as count FROM \${tableName}\`)
          .then(([result]) => ({ table: tableName, count: result[0].count }));
      })
    );
  })
  .then(counts => console.log(JSON.stringify(counts, null, 2)))
  .finally(() => process.exit(0));
"
```

**Query specific data:**
```bash
cd backend && node -e "
const db = require('./src/models');
db.sequelize.query('SELECT * FROM books LIMIT 5')
  .then(([results]) => console.log(JSON.stringify(results, null, 2)))
  .finally(() => process.exit(0));
"
```

## Database Prerequisites

If you get `Error: Unknown database 'checked_out'`:
1. Database hasn't been created yet
2. Document this as a blocker in verification
3. Provide setup instructions for human

**Setup commands (for human):**
```bash
# Create database
mysql -u root -p <<EOF
CREATE DATABASE checked_out CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

# Run migrations
cd backend && npm run db:migrate

# Seed database (optional)
npm run db:seed
```
