#!/usr/bin/env bash
#
# check-test-ratio.sh — enforce the "every new page/component has a
# sibling test file" rule from standards/e2e-testing.md (issue #229
# item #14).
#
# Looks at files staged for commit (Added only) under:
#   frontend/src/pages/**
#   frontend/src/components/**
#
# For each `.tsx` / `.jsx` / `.ts` / `.js` source file it expects a
# sibling test within the same directory or one directory level up,
# named `<Name>.test.{ts,tsx,js,jsx}` (also staged, because the point
# is that the commit introducing the component also introduces its
# test).
#
# Exits 0 if nothing to check or all new files have tests. Exits 1
# with a list of offenders otherwise. The script is safe to run
# outside of git: if there is no staged diff it simply does nothing.
#
# Portable: works on macOS /bin/bash 3.2 (no `mapfile`).

set -eu

#
# Modes:
#   (default)   pre-commit — checks staged additions/renames/copies
#   --ci BASE   CI mode    — checks files added/renamed/copied between
#                            BASE and HEAD (e.g. `--ci origin/main`)
#
# `--diff-filter=ARC` covers Added, Renamed, and Copied so a file split
# (one component refactored into two) is treated as a new file requiring
# its own test.
#

mode="staged"
base_ref=""
if [ "${1:-}" = "--ci" ]; then
  if [ -z "${2:-}" ]; then
    echo "check-test-ratio: --ci requires a base ref (e.g., --ci origin/main)" >&2
    exit 2
  fi
  mode="ci"
  base_ref="$2"
fi

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  exit 0
fi

if [ "$mode" = "staged" ]; then
  diff_cmd="git diff --cached --name-only --diff-filter=ARC"
  staged_all_cmd="git diff --cached --name-only"
else
  diff_cmd="git diff --name-only --diff-filter=ARC ${base_ref}...HEAD"
  staged_all_cmd="git diff --name-only ${base_ref}...HEAD"
fi

added=$(
  $diff_cmd 2>/dev/null \
    | grep -E '^frontend/src/(pages|components)/.*\.(tsx|ts|jsx|js)$' \
    | grep -Ev '\.(test|spec)\.(tsx|ts|jsx|js)$' \
    || true
)

if [ -z "$added" ]; then
  exit 0
fi

staged_all=$(git diff --cached --name-only 2>/dev/null || true)

missing=""
while IFS= read -r src; do
  [ -z "$src" ] && continue
  dir=$(dirname "$src")
  base=$(basename "$src")
  name="${base%.*}"
  parent=$(dirname "$dir")

  found=0
  for candidate in \
    "$dir/$name.test.tsx" "$dir/$name.test.ts" \
    "$dir/$name.test.jsx" "$dir/$name.test.js" \
    "$dir/$name.spec.tsx" "$dir/$name.spec.ts" \
    "$parent/$name.test.tsx" "$parent/$name.test.ts" \
    "$parent/$name.test.jsx" "$parent/$name.test.js" \
    "$parent/$name.spec.tsx" "$parent/$name.spec.ts"; do
    if printf '%s\n' "$staged_all" | grep -Fxq "$candidate"; then
      found=1
      break
    fi
    if [ -f "$candidate" ]; then
      found=1
      break
    fi
  done

  if [ $found -eq 0 ]; then
    if [ -z "$missing" ]; then
      missing="$src"
    else
      missing="$missing
$src"
    fi
  fi
done <<EOF
$added
EOF

if [ -z "$missing" ]; then
  exit 0
fi

echo "check-test-ratio: new component/page files are missing sibling tests." >&2
echo "" >&2
printf '%s\n' "$missing" | while IFS= read -r src; do
  echo "  - $src" >&2
done
echo "" >&2
echo "Add a <Name>.test.tsx next to each file (or one directory up) and stage it." >&2
echo "See standards/e2e-testing.md section 6 (Quality Budget)." >&2
exit 1
