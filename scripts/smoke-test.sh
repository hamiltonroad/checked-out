#!/bin/bash

# Smoke test gate for Checked Out
# Ensures servers are running, then runs Playwright smoke tests.
# Usage: ./scripts/smoke-test.sh [--start-servers]
#   --start-servers  Start servers automatically if not running

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."

# TEST_MODE disables backend rate limiting for parallel Playwright workers.
# MUST never be enabled outside local automated tests. The backend exits
# at startup if TEST_MODE=true and NODE_ENV=production. See CLAUDE.md and
# frontend/e2e/README.md for details. The ensure_test_mode_backend helper
# below auto-restarts an already-running backend if it wasn't started with
# TEST_MODE=true, so the "already-running backend gotcha" can't silently
# re-enable rate limits under this script.
export TEST_MODE=true

# shellcheck source=lib/ensure-test-mode.sh
source "$SCRIPT_DIR/lib/ensure-test-mode.sh"

# Color output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Checked Out - Smoke Test Gate${NC}"
echo -e "${BLUE}================================================${NC}"

# Ensure backend is running with TEST_MODE=true (restart if drifted).
ensure_test_mode_backend "$1" || exit $?

# Verify frontend separately — helper only manages the backend TEST_MODE state.
if ! lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
  if [ "$1" = "--start-servers" ]; then
    # start-all.sh already ran inside the helper if we got here via a restart;
    # if the frontend is still down, start it directly.
    "$SCRIPT_DIR/start-frontend.sh"
  else
    echo -e "${RED}Frontend NOT running on port 5173.${NC}"
    echo "Run with --start-servers to start it automatically."
    exit 1
  fi
fi
echo -e "${GREEN}✓${NC} Frontend running on port 5173"

# Run smoke tests
echo ""
echo -e "${BLUE}Running Playwright smoke tests...${NC}"
echo ""

cd "$PROJECT_DIR" && npx playwright test --project=smoke 2>&1
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
