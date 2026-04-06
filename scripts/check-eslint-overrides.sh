#!/usr/bin/env bash
# HARNESS-MAX-LINES-OVERRIDE-GUARD (issue #230)
#
# Fails if `'max-lines': 'off'` (or `"max-lines": "off"`) appears in any
# ESLint config outside the documented allowlist. Per CLAUDE.md, max-lines
# overrides are forbidden except for tests, types/config/theme files,
# seeders, and e2e specs (the spec rule itself uses max-lines: error,
# not off — only test/type/seeder blocks may disable it).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Files we scan
files=(
  "backend/.eslintrc.json"
  "frontend/eslint.config.js"
)

# Allowed contexts: each entry is a regex matched against the LINE 25
# lines BEFORE the offending occurrence (lookback window). If any
# allowlist marker appears in the lookback, the occurrence is allowed.
allow_markers=(
  "test\\."
  "spec\\."
  "__tests__"
  "/types/"
  "/theme/"
  "/config/"
  "seeders"
  "Type, config, and theme"
)

violations=0

for f in "${files[@]}"; do
  [ -f "$f" ] || continue
  # Find each line containing max-lines: 'off' or "off"
  while IFS=: read -r line_no _; do
    [ -z "$line_no" ] && continue
    start=$(( line_no - 25 ))
    [ $start -lt 1 ] && start=1
    context=$(sed -n "${start},${line_no}p" "$f")
    allowed=0
    for marker in "${allow_markers[@]}"; do
      if echo "$context" | grep -Eq "$marker"; then
        allowed=1
        break
      fi
    done
    if [ $allowed -eq 0 ]; then
      echo "[HARNESS-MAX-LINES-OVERRIDE-GUARD issue #230] Disallowed max-lines: 'off' in $f at line $line_no" >&2
      violations=$(( violations + 1 ))
    fi
  done < <(grep -nE "['\"]max-lines['\"]\\s*:\\s*['\"]off['\"]" "$f" 2>/dev/null || true)
done

if [ $violations -gt 0 ]; then
  echo "" >&2
  echo "max-lines may only be disabled inside override blocks scoped to:" >&2
  echo "  test files, type/theme/config files, seeders, or e2e fixture infrastructure." >&2
  echo "If a new exemption is required, document it in CLAUDE.md and add an allow marker." >&2
  exit 1
fi

echo "[HARNESS-MAX-LINES-OVERRIDE-GUARD] OK — no disallowed max-lines overrides."
