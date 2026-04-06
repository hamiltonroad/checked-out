#!/usr/bin/env bash
# HARNESS-ENV-SINGLE-SOURCE (issue #230)
#
# Minimal enforcement for the "env-var defaults defined once per concern"
# rule from CLAUDE.md. Counts occurrences of known env-var default
# literals across the tree and fails if any of them appear in more than
# one file, forcing a refactor to a shared config module.
#
# This is intentionally a shallow grep check. The plan's fuller
# solution — a tsconfig path-mapping refactor plus an ESLint rule
# banning direct `import.meta.env`/`process.env` reads — is tracked as
# the Rec #19 follow-up on issue #230. Until that refactor lands the
# current tree has a known baseline of 3 duplications of
# VITE_API_BASE_URL; the check warns above the baseline rather than
# failing on it so it can be wired into pre-commit without blocking
# work. Lower the baseline as duplications are removed.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Each entry: human label + baseline count + literal string.
# Lower the baseline as refactors eliminate duplications.
declare -a patterns=(
  "VITE_API_BASE_URL default|2|http://localhost:3000/api/v1"
)

regressions=0
for row in "${patterns[@]}"; do
  label="${row%%|*}"
  rest="${row#*|}"
  baseline="${rest%%|*}"
  needle="${rest#*|}"
  hits=$(grep -rlF "$needle" \
    --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
    frontend backend 2>/dev/null || true)
  count=$(printf '%s\n' "$hits" | sed '/^$/d' | wc -l | tr -d ' ')
  if [ "$count" -gt "$baseline" ]; then
    echo "[HARNESS-ENV-SINGLE-SOURCE issue #230] $label regressed: $count files (baseline $baseline):" >&2
    printf '%s\n' "$hits" | sed 's/^/  - /' >&2
    regressions=$(( regressions + 1 ))
  elif [ "$count" -gt 1 ]; then
    echo "[HARNESS-ENV-SINGLE-SOURCE] WARN: $label still duplicated in $count files (baseline $baseline) — Rec #19 refactor pending."
  fi
done

if [ "$regressions" -gt 0 ]; then
  echo "" >&2
  echo "A new duplication was introduced above the baseline. Move the default to a shared config module instead of adding another copy. See CLAUDE.md HARNESS-ENV-SINGLE-SOURCE." >&2
  exit 1
fi

echo "[HARNESS-ENV-SINGLE-SOURCE] OK — no new duplications above baseline."
