#!/bin/bash

# Smoke test gate for Checked Out
# Ensures servers are running, then runs Playwright smoke tests.
# Usage: ./scripts/smoke-test.sh [--start-servers]
#   --start-servers  Start servers automatically if not running

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."

# Color output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Checked Out - Smoke Test Gate${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if servers are running
FRONTEND_RUNNING=false
BACKEND_RUNNING=false

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
  FRONTEND_RUNNING=true
  echo -e "${GREEN}✓${NC} Frontend running on port 5173"
else
  echo -e "${RED}✗${NC} Frontend NOT running on port 5173"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  BACKEND_RUNNING=true
  echo -e "${GREEN}✓${NC} Backend running on port 3000"
else
  echo -e "${RED}✗${NC} Backend NOT running on port 3000"
fi

# Start servers if needed and --start-servers flag is set
if [ "$FRONTEND_RUNNING" = false ] || [ "$BACKEND_RUNNING" = false ]; then
  if [ "$1" = "--start-servers" ]; then
    echo ""
    echo -e "${BLUE}Starting servers...${NC}"
    "$SCRIPT_DIR/start-all.sh"
    echo ""
  else
    echo ""
    echo -e "${RED}Servers are not running.${NC}"
    echo "Run with --start-servers to start them automatically, or:"
    echo "  ./scripts/start-all.sh"
    exit 1
  fi
fi

# Run smoke tests
echo ""
echo -e "${BLUE}Running Playwright smoke tests...${NC}"
echo ""

cd "$PROJECT_DIR" && npx playwright test 2>&1
RESULT=$?

echo ""
if [ $RESULT -eq 0 ]; then
  echo -e "${GREEN}================================================${NC}"
  echo -e "${GREEN}✓ Smoke test PASSED${NC}"
  echo -e "${GREEN}================================================${NC}"
else
  echo -e "${RED}================================================${NC}"
  echo -e "${RED}✗ Smoke test FAILED${NC}"
  echo -e "${RED}================================================${NC}"
  echo ""
  echo "Suggested actions:"
  echo "  1. Check server logs: logs/backend.log and logs/frontend.log"
  echo "  2. Check browser console for errors"
  echo "  3. Fix the issue and re-run: ./scripts/smoke-test.sh"
fi

exit $RESULT
