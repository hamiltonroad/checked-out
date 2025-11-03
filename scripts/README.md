# Checked Out - Utility Scripts

Helper scripts for managing the Checked Out application services.

## Available Scripts

### `start-all.sh`

Start both backend and frontend services (if not already running).

```bash
./scripts/start-all.sh
```

**What it does:**
- Checks if backend is running, starts if needed
- Checks if frontend is running, starts if needed
- Shows status summary with URLs
- Creates log files in `logs/` directory

**Services started:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

### `start-backend.sh`

Start only the backend server (if not already running).

```bash
./scripts/start-backend.sh
```

**What it does:**
- Checks if backend is running on port 3000
- If running: Shows process info and exits
- If not running:
  - Installs dependencies if needed (`npm install`)
  - Creates `.env` from `.env.example` if missing
  - Starts backend in background
  - Tests health endpoint
  - Shows process info and URLs

**Output:**
- Process ID
- Health check URL: http://localhost:3000/health
- API base URL: http://localhost:3000/api
- Log file location

---

### `start-frontend.sh`

Start only the frontend dev server (if not already running).

```bash
./scripts/start-frontend.sh
```

**What it does:**
- Checks if frontend is running on port 5173
- If running: Shows process info and exits
- If not running:
  - Installs dependencies if needed (`npm install`)
  - Creates `.env` from `.env.example` if missing
  - Starts frontend in background
  - Shows process info and URL

**Output:**
- Process ID
- Frontend URL: http://localhost:5173
- Log file location

---

### `stop-all.sh`

Stop both backend and frontend services.

```bash
./scripts/stop-all.sh
```

**What it does:**
- Stops backend server (port 3000)
- Stops frontend server (port 5173)
- Forces stop if graceful shutdown fails

---

## Log Files

All scripts create log files in the `logs/` directory:

```bash
logs/
├── backend.log    # Backend server output
└── frontend.log   # Frontend dev server output
```

**View logs in real-time:**
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log
```

---

## Manual Service Management

### Stop Individual Services

**Stop backend:**
```bash
lsof -ti:3000 | xargs kill
```

**Stop frontend:**
```bash
lsof -ti:5173 | xargs kill
```

### Check If Services Are Running

**Backend:**
```bash
lsof -Pi :3000 -sTCP:LISTEN
```

**Frontend:**
```bash
lsof -Pi :5173 -sTCP:LISTEN
```

### View Running Processes

```bash
# All Node processes
ps aux | grep node

# Specific to our services
ps aux | grep -E "(frontend|backend)"
```

---

## Troubleshooting

### Script Won't Execute

Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### Port Already In Use

If ports are in use by other applications:

**Backend (port 3000):**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
lsof -ti:3000 | xargs kill
```

**Frontend (port 5173):**
```bash
# Find what's using the port
lsof -i :5173

# Kill the process
lsof -ti:5173 | xargs kill
```

### Service Won't Start

1. Check log files: `logs/backend.log` or `logs/frontend.log`
2. Verify dependencies installed: `npm install` in respective directory
3. Check `.env` file exists and has correct values
4. For backend: Verify MySQL is running and credentials are correct

### Dependencies Not Installed

Scripts will automatically run `npm install` if `node_modules` is missing, but you can also install manually:

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

---

## Tips

### Quick Start After Fresh Clone

```bash
# One command to start everything
./scripts/start-all.sh
```

The script will:
1. Install dependencies if needed
2. Create `.env` files from examples
3. Start both services
4. Show you URLs to access the app

### Development Workflow

```bash
# Start everything
./scripts/start-all.sh

# ... do development work ...

# Stop everything when done
./scripts/stop-all.sh
```

### Check Service Status

```bash
# Just run the start script - it will show status if already running
./scripts/start-backend.sh
./scripts/start-frontend.sh
```
