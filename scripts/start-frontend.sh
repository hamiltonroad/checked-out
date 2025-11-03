#!/bin/bash

# Frontend startup script for Checked Out
# Checks if frontend is running on port 5173, starts it if not

FRONTEND_PORT=5173
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"
LOG_DIR="$SCRIPT_DIR/../logs"
LOG_FILE="$LOG_DIR/frontend.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================"
echo "Frontend Startup Script"
echo "================================================"

# Check if frontend is already running
check_running() {
  if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Get process info
get_process_info() {
  lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN | tail -n 1
}

if check_running; then
  echo -e "${GREEN}✓${NC} Frontend is already running on port $FRONTEND_PORT"
  echo
  echo "Process info:"
  get_process_info
  echo
  echo "Frontend URL: http://localhost:$FRONTEND_PORT"
  exit 0
fi

# Frontend is not running, start it
echo -e "${YELLOW}⚠${NC} Frontend is not running on port $FRONTEND_PORT"
echo "Starting frontend..."
echo

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${RED}✗${NC} Error: Frontend directory not found at $FRONTEND_DIR"
  exit 1
fi

# Check if node_modules exists
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "${YELLOW}⚠${NC} node_modules not found. Running npm install..."
  cd "$FRONTEND_DIR" || exit 1
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} npm install failed"
    exit 1
  fi
  echo -e "${GREEN}✓${NC} Dependencies installed"
fi

# Check if .env exists
if [ ! -f "$FRONTEND_DIR/.env" ]; then
  echo -e "${YELLOW}⚠${NC} .env file not found. Creating from .env.example..."
  if [ -f "$FRONTEND_DIR/.env.example" ]; then
    cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"
    echo -e "${GREEN}✓${NC} .env file created"
  else
    echo -e "${RED}✗${NC} Warning: .env.example not found"
  fi
fi

# Start frontend in background
echo "Starting frontend server..."
cd "$FRONTEND_DIR" || exit 1

# Start with npm run dev, redirect output to log file
nohup npm run dev > "$LOG_FILE" 2>&1 &
FRONTEND_PID=$!

# Wait a few seconds for startup
echo "Waiting for frontend to start..."
sleep 3

# Check if process is still running and port is listening
if check_running; then
  echo -e "${GREEN}✓${NC} Frontend started successfully!"
  echo
  echo "Process ID: $FRONTEND_PID"
  echo "Log file: $LOG_FILE"
  echo "Frontend URL: http://localhost:$FRONTEND_PORT"
  echo
  echo "To stop frontend:"
  echo "  lsof -ti:$FRONTEND_PORT | xargs kill"
  echo
  echo "To view logs:"
  echo "  tail -f $LOG_FILE"
else
  echo -e "${RED}✗${NC} Frontend failed to start"
  echo "Check log file for details: $LOG_FILE"
  exit 1
fi
