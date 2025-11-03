#!/bin/bash

# Stop all Checked Out services

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "Stopping Checked Out Services"
echo "================================================"
echo

# Stop backend (port 3000)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Stopping backend (port 3000)..."
  lsof -ti:3000 | xargs kill
  sleep 1
  if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Backend still running, forcing stop..."
    lsof -ti:3000 | xargs kill -9
  fi
  echo -e "${GREEN}✓${NC} Backend stopped"
else
  echo "Backend is not running"
fi

echo

# Stop frontend (port 5173)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Stopping frontend (port 5173)..."
  lsof -ti:5173 | xargs kill
  sleep 1
  if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Frontend still running, forcing stop..."
    lsof -ti:5173 | xargs kill -9
  fi
  echo -e "${GREEN}✓${NC} Frontend stopped"
else
  echo "Frontend is not running"
fi

echo
echo -e "${GREEN}✓${NC} All services stopped"
