#!/bin/bash

# Backend startup script for Checked Out
# Checks if backend is running on port 3000, starts it if not

BACKEND_PORT=3000
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
LOG_DIR="$SCRIPT_DIR/../logs"
LOG_FILE="$LOG_DIR/backend.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================"
echo "Backend Startup Script"
echo "================================================"

# Check if backend is already running
check_running() {
  if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Get process info
get_process_info() {
  lsof -Pi :$BACKEND_PORT -sTCP:LISTEN | tail -n 1
}

if check_running; then
  echo -e "${GREEN}✓${NC} Backend is already running on port $BACKEND_PORT"
  echo
  echo "Process info:"
  get_process_info
  echo
  echo "Health check: http://localhost:$BACKEND_PORT/health"
  echo "API base URL: http://localhost:$BACKEND_PORT/api"
  exit 0
fi

# Backend is not running, start it
echo -e "${YELLOW}⚠${NC} Backend is not running on port $BACKEND_PORT"
echo "Starting backend..."
echo

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${RED}✗${NC} Error: Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Check if node_modules exists
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo -e "${YELLOW}⚠${NC} node_modules not found. Running npm install..."
  cd "$BACKEND_DIR" || exit 1
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} npm install failed"
    exit 1
  fi
  echo -e "${GREEN}✓${NC} Dependencies installed"
fi

# Check if .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo -e "${YELLOW}⚠${NC} .env file not found. Creating from .env.example..."
  if [ -f "$BACKEND_DIR/.env.example" ]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo -e "${GREEN}✓${NC} .env file created"
    echo -e "${YELLOW}⚠${NC} Please edit backend/.env with your database credentials"
  else
    echo -e "${RED}✗${NC} Warning: .env.example not found"
  fi
fi

# Start backend in background
echo "Starting backend server..."
cd "$BACKEND_DIR" || exit 1

# Start with npm run dev, redirect output to log file
nohup npm run dev > "$LOG_FILE" 2>&1 &
BACKEND_PID=$!

# Wait a few seconds for startup
echo "Waiting for backend to start..."
sleep 3

# Check if process is still running and port is listening
if check_running; then
  echo -e "${GREEN}✓${NC} Backend started successfully!"
  echo
  echo "Process ID: $BACKEND_PID"
  echo "Log file: $LOG_FILE"
  echo "Health check: http://localhost:$BACKEND_PORT/health"
  echo "API base URL: http://localhost:$BACKEND_PORT/api"
  echo

  # Test health endpoint
  echo "Testing health endpoint..."
  HEALTH_CHECK=$(curl -s http://localhost:$BACKEND_PORT/health 2>/dev/null)
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Health check passed: $HEALTH_CHECK"
  else
    echo -e "${YELLOW}⚠${NC} Could not reach health endpoint (may still be starting up)"
  fi

  echo
  echo "To stop backend:"
  echo "  lsof -ti:$BACKEND_PORT | xargs kill"
  echo
  echo "To view logs:"
  echo "  tail -f $LOG_FILE"
else
  echo -e "${RED}✗${NC} Backend failed to start"
  echo "Check log file for details: $LOG_FILE"
  exit 1
fi
