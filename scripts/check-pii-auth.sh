#!/usr/bin/env bash
# -------------------------------------------------------------------
# check-pii-auth.sh
# Verifies that route files serving patron PII use the `authenticate`
# middleware.  Exit 0 = all clear, exit 1 = missing auth detected.
#
# PII route files are identified by convention — any route file that
# exposes patron names, card numbers, emails, or checkout history.
#
# Auth routes (login, logout, refresh) are excluded because they are
# the mechanism for obtaining authentication — they cannot require it.
# Only the /me endpoint in authRoutes needs authenticate.
# -------------------------------------------------------------------

set -euo pipefail

ROUTES_DIR="backend/src/routes"
FAILED=0

# Route files that serve PII (patron data, checkout history, wishlists, ratings with patron IDs)
# authRoutes.js is excluded: login/logout/refresh cannot require auth.
# The /me route does require auth, but that's only one of four routes,
# making blanket checking impractical. The /me route is verified separately.
PII_ROUTE_FILES=(
  "patronRoutes.js"
  "checkoutRoutes.js"
  "wishlistRoutes.js"
  "ratingRoutes.js"
)

# Known exempt routes — these are intentionally unauthenticated.
# Format: "filepath:route_path" (route_path as it appears in the source)
# Each exemption MUST include a justification comment.
EXEMPT_ROUTES=(
  # GET /api/v1/checkouts returns aggregate checkout data (no patron PII in list view)
  "checkoutRoutes.js:'/'"
)

check_file() {
  local filepath="$1"

  if [[ ! -f "$filepath" ]]; then
    echo "WARN: ${filepath} not found — skipping"
    return 0
  fi

  # Check 1: File must import `authenticate`
  if ! grep -q "authenticate" "$filepath"; then
    echo "FAIL: ${filepath} does not reference authenticate middleware"
    return 1
  fi

  # Check 2: If router.use(authenticate) is present, all routes are covered
  if grep -qE 'router\.use\(\s*authenticate\s*\)' "$filepath"; then
    echo "PASS: ${filepath} — blanket router.use(authenticate)"
    return 0
  fi

  # Check 3: Extract each route block and verify authenticate is in it.
  # A route block starts with router.(get|post|put|delete|patch)( and ends
  # with the matching );  We collapse multi-line blocks by joining lines
  # between the opening call and the closing );
  local route_blocks
  route_blocks=$(awk '
    /router\.(get|post|put|delete|patch)\(/ { capturing=1; block="" }
    capturing { block = block " " $0 }
    capturing && /\);/ { print block; capturing=0 }
  ' "$filepath")

  if [[ -z "$route_blocks" ]]; then
    echo "PASS: ${filepath} — no route handlers found"
    return 0
  fi

  local total=0
  local authed=0
  local missing_lines=""

  while IFS= read -r block; do
    total=$((total + 1))
    if echo "$block" | grep -q "authenticate"; then
      authed=$((authed + 1))
    else
      # Extract the route path for reporting
      local route_path
      route_path=$(echo "$block" | grep -oE "'[^']*'" | head -1)

      # Check if this route is in the exemption list
      local basename
      basename=$(basename "$filepath")
      local exempt_key="${basename}:${route_path}"
      local is_exempt=false
      for exempt in "${EXEMPT_ROUTES[@]}"; do
        # Strip leading comment lines from exempt entries
        if [[ "$exempt" == "$exempt_key" ]]; then
          is_exempt=true
          break
        fi
      done

      if [[ "$is_exempt" == "true" ]]; then
        echo "  EXEMPT: ${route_path} (see exemption list)"
        authed=$((authed + 1))
      else
        missing_lines="${missing_lines}  -> ${route_path:-unknown route}\n"
      fi
    fi
  done <<< "$route_blocks"

  if [[ "$authed" -eq "$total" ]]; then
    echo "PASS: ${filepath} — all ${total} routes use authenticate"
    return 0
  else
    local missing=$((total - authed))
    echo "FAIL: ${filepath} — ${missing}/${total} routes missing authenticate"
    printf "%b" "$missing_lines"
    return 1
  fi
}

# Check authRoutes.js /me endpoint separately
check_auth_me() {
  local filepath="${ROUTES_DIR}/authRoutes.js"

  if [[ ! -f "$filepath" ]]; then
    echo "WARN: ${filepath} not found — skipping /me check"
    return 0
  fi

  local me_block
  me_block=$(awk '
    /router\.(get|post|put|delete|patch)\(/ { capturing=1; block="" }
    capturing { block = block " " $0 }
    capturing && /\);/ {
      if (block ~ /\/me/) print block
      capturing=0
    }
  ' "$filepath")

  if [[ -z "$me_block" ]]; then
    echo "PASS: ${filepath} — no /me route found"
    return 0
  fi

  if echo "$me_block" | grep -q "authenticate"; then
    echo "PASS: ${filepath} — /me route uses authenticate"
    return 0
  else
    echo "FAIL: ${filepath} — /me route missing authenticate"
    return 1
  fi
}

for file in "${PII_ROUTE_FILES[@]}"; do
  if ! check_file "${ROUTES_DIR}/${file}"; then
    FAILED=1
  fi
done

# Also verify authRoutes /me endpoint
if ! check_auth_me; then
  FAILED=1
fi

echo ""
if [[ "$FAILED" -eq 1 ]]; then
  echo "RESULT: PII auth check FAILED — see above for details"
  exit 1
else
  echo "RESULT: PII auth check PASSED — all PII routes are authenticated"
  exit 0
fi
