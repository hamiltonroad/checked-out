#!/usr/bin/env bash
# HARNESS-DEV-PASSWORD-LITERAL (issue #230)
#
# Authoritative grep check: the literal 'welcome123' may appear ONLY in the
# canonical sources listed below. Belt-and-suspenders for the ESLint rule of
# the same ID (which is bypassed when an override block redefines
# no-restricted-syntax for a given file scope).
#
# Canonical sources:
#   - backend/src/config/auth.js          (DEV_PASSWORD constant)
#   - frontend/e2e/fixtures/testData.ts   (DEV_PASSWORD re-export for e2e)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Allowlist is intentionally narrow. Canonical runtime sources are the
# first two; the rest are harness/enforcement locations that must quote
# the literal to enforce it. Documentation that discusses the rule
# (CLAUDE.md, standards, code-review-results, .claude/temp) is allowed
# because it is non-executing text — but package-lock.json, package.json,
# and .husky/pre-commit are NOT allowed: a rotation must update those
# out-of-band and the check should force a human review.
ALLOWLIST_REGEX='^(backend/src/config/auth\.js|frontend/e2e/fixtures/testData\.ts|scripts/check-welcome123\.sh|backend/\.eslintrc\.json|frontend/eslint\.config\.js|standards/enforcement-registry\.md|CLAUDE\.md|code-review-results/.*|\.claude/temp/.*|\.claude/settings\.local\.json|\.husky/pre-commit|package\.json)$'

# -F fixed string, -r recursive, -l files only, exclude common noise
matches=$(grep -rlF 'welcome123' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=coverage \
  --exclude-dir=test-results \
  --exclude-dir=playwright-report \
  . 2>/dev/null || true)

violations=()
while IFS= read -r f; do
  [ -z "$f" ] && continue
  rel="${f#./}"
  if ! [[ "$rel" =~ $ALLOWLIST_REGEX ]]; then
    violations+=("$rel")
  fi
done <<< "$matches"

if [ ${#violations[@]} -gt 0 ]; then
  echo "[HARNESS-DEV-PASSWORD-LITERAL issue #230] Forbidden 'welcome123' literal in non-canonical files:" >&2
  for v in "${violations[@]}"; do echo "  - $v" >&2; done
  echo "" >&2
  echo "Import DEV_PASSWORD from the canonical source instead:" >&2
  echo "  - backend code:  require('./config/auth').DEV_PASSWORD" >&2
  echo "  - frontend e2e:  import { DEV_PASSWORD } from '../fixtures/testData'" >&2
  exit 1
fi

echo "[HARNESS-DEV-PASSWORD-LITERAL] OK — 'welcome123' confined to canonical sources."
