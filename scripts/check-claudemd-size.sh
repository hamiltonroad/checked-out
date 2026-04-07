#!/usr/bin/env bash
# check-claudemd-size.sh — emit a prune-reminder when CLAUDE.md grows too large.
#
# Invoked by story-runner and batch-runner. Non-blocking: always exits 0.
# Prints a warning to stdout when `wc -l CLAUDE.md` exceeds the threshold.

set -euo pipefail

THRESHOLD=120

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || (cd "$(dirname "$0")/.." && pwd))"
CLAUDE_MD="$ROOT/CLAUDE.md"

if [[ ! -f "$CLAUDE_MD" ]]; then
  exit 0
fi

lines=$(wc -l < "$CLAUDE_MD" | tr -d ' ')

if (( lines > THRESHOLD )); then
  echo "WARNING: CLAUDE.md is now ${lines} lines (>${THRESHOLD}). Time to consider pruning."
  echo "See standards/harness-prune-checklist.md for the prune-cycle steps."
fi

exit 0
