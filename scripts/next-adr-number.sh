#!/usr/bin/env bash
# next-adr-number.sh — print the next free ADR integer (zero-padded to 3 digits).
#
# Usage: bash scripts/next-adr-number.sh
#        bash scripts/next-adr-number.sh --help
#
# Inspects docs/adr/NNN-*.md filenames, finds the maximum 3-digit prefix,
# and prints (max + 1) zero-padded to 3 digits. Use this when creating a
# new ADR to avoid duplicate numbers.

set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  echo "Usage: bash scripts/next-adr-number.sh"
  echo "Prints the next free ADR integer based on docs/adr/NNN-*.md filenames."
  exit 0
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || (cd "$(dirname "$0")/.." && pwd))"
ADR_DIR="$ROOT/docs/adr"

max=0
for f in "$ADR_DIR"/[0-9][0-9][0-9]-*.md; do
  [[ -e "$f" ]] || continue
  base="$(basename "$f")"
  num="${base:0:3}"
  num_int=$((10#$num))
  if (( num_int > max )); then
    max=$num_int
  fi
done

next=$((max + 1))
printf '%03d\n' "$next"
