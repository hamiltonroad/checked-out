#!/usr/bin/env bash
# HARNESS-ORPHAN-JSDOC (issue #230)
#
# Flags JSDoc /** ... */ blocks separated from the following code by
# TWO OR MORE blank lines. A single blank line is permitted because
# many existing files use it as a stylistic separator for "section
# header" JSDoc that describes the next group of statements rather
# than a single declaration. Two blank lines almost always indicate
# the JSDoc has been stranded from its intended declaration — the
# specific orphan pattern that landed in the issue #220 review.
#
# Future enhancement (deferred): a real ESLint custom rule that walks
# the AST and verifies the JSDoc block immediately precedes a
# declaration node. Tracked in standards/enforcement-registry.md.
#
# Scope: backend/src and frontend/src .js/.jsx/.ts/.tsx files.
# Exits non-zero if any orphan blocks are found.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

scan_file() {
  local file="$1"
  awk '
    BEGIN { in_block=0; end_line=0; block_start=0 }
    {
      if (in_block==0 && $0 ~ /\/\*\*/) {
        in_block=1
        block_start=NR
        # Single-line /** ... */
        if ($0 ~ /\*\//) {
          end_line=NR
          in_block=2  # waiting for next line
        }
        next
      }
      if (in_block==1 && $0 ~ /\*\//) {
        end_line=NR
        in_block=2
        next
      }
      if (in_block==2) {
        if (block_start <= 2) { in_block=0; next }
        stripped=$0
        gsub(/[ \t\r]/, "", stripped)
        if (stripped == "") {
          in_block=3
          next
        }
        in_block=0
        next
      }
      if (in_block==3) {
        # Second consecutive line after */; another blank means orphan.
        stripped=$0
        gsub(/[ \t\r]/, "", stripped)
        if (stripped == "") {
          printf("%s:%d\n", FILENAME, end_line)
          in_block=0
          next
        }
        in_block=0
        next
      }
    }
  ' "$file"
}

results=""
while IFS= read -r f; do
  out=$(scan_file "$f")
  if [ -n "$out" ]; then
    results="${results}${out}
"
  fi
done < <(find backend/src frontend/src -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' \) 2>/dev/null)

if [ -n "$results" ]; then
  echo "[HARNESS-ORPHAN-JSDOC issue #230] Orphaned JSDoc blocks (closing */ followed by a blank line before code):" >&2
  echo "$results" | sed '/^$/d' | sed 's/^/  - /' >&2
  echo "" >&2
  echo "Move the JSDoc block to immediately precede its declaration (no blank line between)." >&2
  exit 1
fi

echo "[HARNESS-ORPHAN-JSDOC] OK — no orphaned JSDoc blocks found."
