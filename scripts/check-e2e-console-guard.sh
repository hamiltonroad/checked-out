#!/usr/bin/env bash
# HARNESS-E2E-CONSOLE-GUARD (issue #241)
#
# Bash backstop for the e2e console guard. Fails if any spec file under
# frontend/e2e/{smoke,flow,security}/**/*.spec.ts imports `test` (or
# `expect`) as a value from `@playwright/test` directly. Specs MUST
# import them from `frontend/e2e/fixtures/consoleGuard.ts` so that the
# fixture's per-test console/pageerror/unhandled-rejection assertions
# run automatically.
#
# Type-only imports (`import type { Page } from '@playwright/test'`)
# remain allowed because they have no runtime impact.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

violations=()

shopt -s nullglob
for dir in frontend/e2e/smoke frontend/e2e/flow frontend/e2e/security; do
  for f in "$dir"/*.spec.ts "$dir"/**/*.spec.ts; do
    [ -f "$f" ] || continue
    # Match value imports of test/expect from @playwright/test.
    # `import type { ... } from '@playwright/test'` is exempt.
    if grep -qE "^import[[:space:]]+\{[^}]*\b(test|expect)\b[^}]*\}[[:space:]]+from[[:space:]]+['\"]@playwright/test['\"]" "$f"; then
      violations+=("$f")
    fi
  done
done

if [ ${#violations[@]} -gt 0 ]; then
  echo "[HARNESS-E2E-CONSOLE-GUARD issue #241] Forbidden direct @playwright/test import in spec(s):" >&2
  for v in "${violations[@]}"; do echo "  - $v" >&2; done
  echo "" >&2
  echo "Specs MUST import { test, expect } from frontend/e2e/fixtures/consoleGuard.ts" >&2
  echo "so the per-test console + uncaught-error guard runs automatically." >&2
  echo "Type-only imports of Page/Locator from @playwright/test remain allowed." >&2
  exit 1
fi

echo "[HARNESS-E2E-CONSOLE-GUARD] OK"
