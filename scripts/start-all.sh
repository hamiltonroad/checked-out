#!/bin/bash

# Master startup script for Checked Out
# Starts both backend and frontend if not already running

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Checked Out - Starting All Services${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Start backend
echo -e "${BLUE}[1/2] Starting Backend...${NC}"
echo
"$SCRIPT_DIR/start-backend.sh"
BACKEND_STATUS=$?

echo
echo "---"
echo

# Start frontend
echo -e "${BLUE}[2/2] Starting Frontend...${NC}"
echo
"$SCRIPT_DIR/start-frontend.sh"
FRONTEND_STATUS=$?

echo
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}================================================${NC}"

if [ $BACKEND_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Backend: http://localhost:3000"
else
  echo -e "✗ Backend: Failed to start"
fi

if [ $FRONTEND_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Frontend: http://localhost:5173"
else
  echo -e "✗ Frontend: Failed to start"
fi

echo
echo "Log files:"
echo "  Backend:  $SCRIPT_DIR/../logs/backend.log"
echo "  Frontend: $SCRIPT_DIR/../logs/frontend.log"
echo

if [ $BACKEND_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ All services started successfully!${NC}"
  exit 0
else
  echo "⚠ Some services failed to start. Check log files for details."
  exit 1
fi
