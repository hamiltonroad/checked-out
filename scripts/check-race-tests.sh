#!/usr/bin/env bash
# check-race-tests.sh — enforce that any backend service using
# `withSerializableTransaction` has an accompanying `*.race.test.js`.
#
# CLAUDE.md (Issue #228 Rec #1) requires race-condition tests for any service
# that performs aggregate-then-write. This script makes that requirement
# mechanical instead of relying on reviewer vigilance.
#
# Exit codes:
#   0 — every consumer has a sibling race test (or no consumers exist)
#   1 — at least one consumer is missing its race test
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SERVICES_DIR="${REPO_ROOT}/backend/src/services"

if [ ! -d "${SERVICES_DIR}" ]; then
  echo "check-race-tests: services directory not found at ${SERVICES_DIR}"
  exit 0
fi

missing=0
# Find all service files that import withSerializableTransaction.
# Excludes test files (a race test importing the helper is expected).
while IFS= read -r service_file; do
  base="${service_file%.js}"
  race_test="${base}.race.test.js"
  if [ ! -f "${race_test}" ]; then
    if [ "${missing}" -eq 0 ]; then
      echo "ERROR: Services using withSerializableTransaction must have a sibling *.race.test.js"
      echo "       (Issue #228 Rec #1, CLAUDE.md Constraints)"
      echo
    fi
    echo "  missing: ${race_test}"
    echo "    used by: ${service_file}"
    missing=$((missing + 1))
  fi
done < <(grep -rl --include='*.js' --exclude='*.test.js' 'withSerializableTransaction' "${SERVICES_DIR}" 2>/dev/null || true)

if [ "${missing}" -gt 0 ]; then
  echo
  echo "Add a race test that exercises concurrent callers for each missing file."
  exit 1
fi

exit 0
