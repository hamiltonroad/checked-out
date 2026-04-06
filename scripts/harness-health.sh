#!/usr/bin/env bash
# Harness Health Check (issue #230)
#
# Reads standards/enforcement-registry.md and verifies that every
# marker string is still present at its enforcement location. Catches
# silent rule deletion during refactors.
#
# Exit codes:
#   0 — every registered rule is active
#   1 — at least one marker is missing

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REGISTRY="standards/enforcement-registry.md"

if [ ! -f "$REGISTRY" ]; then
  echo "harness-health: registry not found at $REGISTRY" >&2
  exit 1
fi

registered=0
active=0
missing=0
missing_lines=""

# Parse the markdown table. We look for table rows where the first
# pipe-delimited field starts with HARNESS- (registered rule).
while IFS= read -r line; do
  # Strip leading/trailing whitespace
  trimmed="${line#"${line%%[![:space:]]*}"}"
  case "$trimmed" in
    "| HARNESS-"*|"|HARNESS-"*)
      ;;
    *) continue ;;
  esac

  # Split by `|`. Field indices: 1=blank 2=ID 3=issue 4=location 5=marker 6=desc 7=blank
  IFS='|' read -ra fields <<< "$line"
  rule_id="$(echo "${fields[1]}" | sed -e 's/^ *//' -e 's/ *$//')"
  location_raw="$(echo "${fields[3]}" | sed -e 's/^ *//' -e 's/ *$//')"
  marker_raw="$(echo "${fields[4]}" | sed -e 's/^ *//' -e 's/ *$//')"

  # Strip surrounding backticks from location and marker.
  location="${location_raw//\`/}"
  marker="${marker_raw//\`/}"

  registered=$(( registered + 1 ))

  if [ ! -e "$location" ]; then
    missing=$(( missing + 1 ))
    missing_lines+="  - $rule_id: location not found ($location)\n"
    continue
  fi

  if grep -qF "$marker" "$location"; then
    active=$(( active + 1 ))
  else
    missing=$(( missing + 1 ))
    missing_lines+="  - $rule_id: marker '$marker' not found in $location\n"
  fi
done < "$REGISTRY"

echo "harness-health: $registered registered, $active active, $missing missing"
if [ $missing -gt 0 ]; then
  printf "%b" "$missing_lines" >&2
  echo "" >&2
  echo "One or more harness rules have lost their marker. Restore the rule" >&2
  echo "or update standards/enforcement-registry.md if it was intentionally" >&2
  echo "removed (and consider whether the originating issue should be reopened)." >&2
  exit 1
fi
