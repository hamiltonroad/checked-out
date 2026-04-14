#!/bin/bash

# ensure-test-mode.sh — shared helper for test gate scripts
#
# Ensures the backend on port 3000 is running with TEST_MODE=true. If the
# backend is already running without TEST_MODE, it is stopped and restarted
# automatically so parallel Playwright workers don't hit real rate limits.
#
# This closes the "already-running backend" gotcha documented in CLAUDE.md
# for the TEST_MODE rule. The backend advertises its TEST_MODE state via
# GET /health/live in the `data.testMode` field.
#
# Usage (from another script):
#   source "$SCRIPT_DIR/lib/ensure-test-mode.sh"
#   ensure_test_mode_backend --start-servers   # or without flag
#
# Requires TEST_MODE=true to already be exported in the caller's env
# before invoking this function — the restart inherits the env.

ensure_test_mode_backend() {
  local start_flag="$1"
  local script_dir="${SCRIPT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

  local GREEN='\033[0;32m'
  local RED='\033[0;31m'
  local YELLOW='\033[1;33m'
  local BLUE='\033[0;34m'
  local NC='\033[0m'

  if [ "${TEST_MODE:-}" != "true" ]; then
    echo -e "${RED}ensure_test_mode_backend: TEST_MODE must be exported as 'true' before calling.${NC}" >&2
    return 2
  fi

  local backend_running=false
  if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    backend_running=true
  fi

  if [ "$backend_running" = true ]; then
    # Backend is up — check whether it was started with TEST_MODE=true.
    local health_json
    health_json=$(curl -fsS http://localhost:3000/health/live 2>/dev/null || true)

    if [ -z "$health_json" ]; then
      echo -e "${YELLOW}⚠${NC} Backend on port 3000 did not respond to /health/live; restarting."
      "$script_dir/stop-all.sh" >/dev/null
      "$script_dir/start-all.sh"
      return $?
    fi

    # Look for "testMode":true in the JSON. Avoids a jq dependency.
    if echo "$health_json" | grep -q '"testMode"[[:space:]]*:[[:space:]]*true'; then
      echo -e "${GREEN}✓${NC} Backend running with TEST_MODE=true"
      return 0
    fi

    echo -e "${YELLOW}⚠${NC} Backend running WITHOUT TEST_MODE — restarting so parallel tests don't hit rate limits."
    "$script_dir/stop-all.sh" >/dev/null
    echo -e "${BLUE}Restarting servers with TEST_MODE=true...${NC}"
    "$script_dir/start-all.sh"
    return $?
  fi

  # Backend not running at all.
  if [ "$start_flag" = "--start-servers" ]; then
    echo -e "${BLUE}Starting servers with TEST_MODE=true...${NC}"
    "$script_dir/start-all.sh"
    return $?
  fi

  echo -e "${RED}Backend is not running.${NC}" >&2
  echo "Run without --no-start-servers to start it automatically, or:" >&2
  echo "  TEST_MODE=true ./scripts/start-all.sh" >&2
  return 1
}
