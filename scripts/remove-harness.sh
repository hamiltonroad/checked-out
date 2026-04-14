#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------------------------------------------------------------------------
# Harness file inventory — every file that constitutes the AI harness system.
# Paths are relative to the project root.
# ---------------------------------------------------------------------------
FILES=(
  # Core Harness Documents
  CLAUDE.md
  harness.md
  harness-audit.json

  # Standards
  standards/code-review.md
  standards/e2e-testing.md
  standards/enforcement-registry.md
  standards/harness-prune-checklist.md
  standards/issue-authoring-guide-kit.md
  standards/full/backend-standards.md
  standards/full/craftsmanship.md
  standards/full/frontend-standards.md
  standards/full/harness-standard-kit.md
  standards/full/tech-stack.md
  standards/full/ux-standards.md
  standards/quick-ref/backend-quick-ref.md
  standards/quick-ref/craftsmanship-kit.md
  standards/quick-ref/craftsmanship-quick-ref.md
  standards/quick-ref/database-guide.md
  standards/quick-ref/enterprise-patterns-quick-ref.md
  standards/quick-ref/frontend-quick-ref.md
  standards/quick-ref/harness-standard-kit.md
  standards/quick-ref/tech-stack-quick-ref.md
  standards/quick-ref/testing-guide.md
  standards/quick-ref/ux-quick-ref.md

  # Knowledge Base
  knowledge/agent-operations-kit.md
  knowledge/architecture-kit.md
  knowledge/audit-checklist-kit.md
  knowledge/claude-md-kit.md
  knowledge/claude-md-sample-kit.md
  knowledge/concepts-kit.md
  knowledge/context-management-kit.md
  knowledge/hooks-kit.md
  knowledge/sample-files-kit.md
  knowledge/subagents-kit.md
  knowledge/tools-and-trust-kit.md

  # Agent Definitions
  .claude/agents/batch-worker-kit.md
  .claude/agents/code-review-kit.md
  .claude/agents/implement-agent.md
  .claude/agents/implement-kit.md
  .claude/agents/plan-agent.md
  .claude/agents/plan-kit.md
  .claude/agents/prep-agent.md
  .claude/agents/prep-kit.md
  .claude/agents/refine-kit.md
  .claude/agents/swarm-worker-kit.md

  # Skills / Commands
  .claude/commands/EXAMPLE-VERIFICATION-FORMAT.md
  .claude/commands/batch-runner-kit.md
  .claude/commands/batch-runner.md
  .claude/commands/code-review-pr-kit.md
  .claude/commands/generate-issue-kit.md
  .claude/commands/harvest-reviews-kit.md
  .claude/commands/implement-issue-kit.md
  .claude/commands/integrate-kit.md
  .claude/commands/plan-issue-kit.md
  .claude/commands/prep-issue-kit.md
  .claude/commands/refine-issue-kit.md
  .claude/commands/resolve-smoke-failure.md
  .claude/commands/start-worktree-kit.md
  .claude/commands/story-runner-kit.md
  .claude/commands/story-runner.md

  # Claude Settings & Config
  .claude/settings.json

  # Claude Retrospectives & History
  .claude/CHANGES-2025-11-03-testing-gap.md
  .claude/retrospectives/collaborated/11-03-issue1.md

  # Enforcement Scripts
  scripts/check-claudemd-size.sh
  scripts/check-e2e-console-guard.sh
  scripts/check-env-single-source.sh
  scripts/check-eslint-overrides.sh
  scripts/check-orphan-jsdoc.sh
  scripts/check-pii-auth.sh
  scripts/check-race-tests.sh
  scripts/check-test-ratio.sh
  scripts/check-welcome123.sh
  scripts/harness-health.sh

  # Test & Build Scripts
  scripts/e2e-test.sh
  scripts/smoke-test.sh

  # Server Management Scripts
  scripts/start-all.sh
  scripts/start-backend.sh
  scripts/start-frontend.sh
  scripts/stop-all.sh

  # Script Infrastructure
  scripts/lib/ensure-test-mode.sh
  scripts/next-adr-number.sh
  scripts/README.md

  # ESLint Configuration
  backend/.eslintrc.json
  frontend/eslint.config.js

  # Prettier Configuration
  backend/.prettierrc
  backend/.prettierignore
  frontend/.prettierrc
  frontend/.prettierignore

  # Pre-Commit Hooks (Husky)
  .husky/pre-commit
  .husky/_/.gitignore
  .husky/_/applypatch-msg
  .husky/_/commit-msg
  .husky/_/h
  .husky/_/husky.sh
  .husky/_/post-applypatch
  .husky/_/post-checkout
  .husky/_/post-commit
  .husky/_/post-merge
  .husky/_/post-rewrite
  .husky/_/pre-applypatch
  .husky/_/pre-auto-gc
  .husky/_/pre-commit
  .husky/_/pre-merge-commit
  .husky/_/pre-push
  .husky/_/pre-rebase
  .husky/_/prepare-commit-msg

  # Test Configuration
  playwright.config.ts
  backend/vitest.config.js

  # E2E Test Infrastructure
  frontend/e2e/README.md
  frontend/e2e/config/allowlist.test.ts
  frontend/e2e/config/console-allowlist.ts
  frontend/e2e/config/uncaughtErrorAllowlist.ts
  frontend/e2e/fixtures/api.ts
  frontend/e2e/fixtures/auth.ts
  frontend/e2e/fixtures/consoleGuard.ts
  frontend/e2e/fixtures/index.ts
  frontend/e2e/fixtures/seed.ts
  frontend/e2e/fixtures/seedTest.ts
  frontend/e2e/fixtures/testData.ts
  frontend/e2e/fixtures/types.ts
  frontend/e2e/page-objects/.gitkeep
  frontend/e2e/page-objects/BooksPage.ts
  frontend/e2e/page-objects/CheckoutDialog.ts
  frontend/e2e/page-objects/CheckoutsPage.ts
  frontend/e2e/page-objects/PatronDetailPage.ts
  frontend/e2e/page-objects/PatronsPage.ts
  frontend/e2e/page-objects/WaitlistPage.ts
  frontend/e2e/page-objects/index.ts
  frontend/e2e/smoke/app-loads.spec.ts
  frontend/e2e/smoke/book-detail-modal.spec.ts
  frontend/e2e/smoke/book-filters.spec.ts
  frontend/e2e/smoke/books-page-loads.spec.ts
  frontend/e2e/smoke/login-flow.spec.ts
  frontend/e2e/flow/.gitkeep
  frontend/e2e/flow/book-filters-combine.spec.ts
  frontend/e2e/flow/checkout-return.spec.ts
  frontend/e2e/flow/patron-search-detail.spec.ts
  frontend/e2e/flow/waitlist-join-leave.spec.ts
  frontend/e2e/security/.gitkeep
  frontend/e2e/security/checkout-body-spoofing.spec.ts
  frontend/e2e/security/protected-route-redirect.spec.ts
  frontend/e2e/security/rbac-api-enforcement.spec.ts

  # Code Review Results
  code-review-results/metrics.csv
  code-review-results/harness-gaps-2026-04-01.md
  code-review-results/harness-gaps-2026-04-02.md
  code-review-results/harness-gaps-2026-04-05.md
  code-review-results/harness-gaps-2026-04-06.md
  code-review-results/2026-04-06-issue-228.md
  code-review-results/2026-04-06-issue-229.md
  code-review-results/2026-04-06-issue-230.md
  code-review-results/2026-04-06-issue-231.md
  code-review-results/2026-04-06-issue-236.md
  code-review-results/2026-04-07-issue-238.md
  code-review-results/2026-04-07-issue-240.md
  code-review-results/2026-04-07-issue-241.md
  code-review-results/2026-04-13-issue-244.md
  code-review-results/2026-04-14-issue-246.md
  code-review-results/archive/2026-04-01-issue-92.md
  code-review-results/archive/2026-04-01-issue-93.md
  code-review-results/archive/2026-04-01-issue-109.md
  code-review-results/archive/2026-04-01-issue-111.md
  code-review-results/archive/2026-04-01-issue-112.md
  code-review-results/archive/2026-04-01-issue-113.md
  code-review-results/archive/2026-04-01-issue-118.md
  code-review-results/archive/2026-04-01-issue-119.md
  code-review-results/archive/2026-04-01-issue-120.md
  code-review-results/archive/2026-04-01-issue-121.md
  code-review-results/archive/2026-04-01-issue-122.md
  code-review-results/archive/2026-04-01-issue-123.md
  code-review-results/archive/2026-04-01-issue-124.md
  code-review-results/archive/2026-04-01-issue-125.md
  code-review-results/archive/2026-04-01-issue-126.md
  code-review-results/archive/2026-04-01-issue-127.md
  code-review-results/archive/2026-04-01-issue-128.md
  code-review-results/archive/2026-04-01-issue-129.md
  code-review-results/archive/2026-04-01-issue-130.md
  code-review-results/archive/2026-04-01-issue-131.md
  code-review-results/archive/2026-04-01-issue-132.md
  code-review-results/archive/2026-04-02-issue-94.md
  code-review-results/archive/2026-04-02-issue-151.md
  code-review-results/archive/2026-04-02-issue-155.md
  code-review-results/archive/2026-04-03-issue-95.md
  code-review-results/archive/2026-04-03-issue-96.md
  code-review-results/archive/2026-04-03-issue-97.md
  code-review-results/archive/2026-04-03-issue-98.md
  code-review-results/archive/2026-04-03-issue-99.md
  code-review-results/archive/2026-04-03-issue-100.md
  code-review-results/archive/2026-04-03-issue-156.md
  code-review-results/archive/2026-04-03-issue-157.md
  code-review-results/archive/2026-04-03-issue-161.md
  code-review-results/archive/2026-04-04-issue-177.md
  code-review-results/archive/2026-04-04-issue-179.md
  code-review-results/archive/2026-04-04-issue-180.md
  code-review-results/archive/2026-04-04-issue-181.md
  code-review-results/archive/2026-04-05-issue-184.md
  code-review-results/archive/2026-04-05-issue-186.md
  code-review-results/archive/2026-04-05-issue-188.md
  code-review-results/archive/2026-04-05-issue-189.md
  code-review-results/archive/2026-04-05-issue-190.md
  code-review-results/archive/2026-04-05-issue-191.md
  code-review-results/archive/2026-04-05-issue-197.md
  code-review-results/archive/2026-04-05-issue-198.md
  code-review-results/archive/2026-04-05-issue-199.md
  code-review-results/archive/2026-04-05-issue-200.md
  code-review-results/archive/2026-04-05-issue-204.md
  code-review-results/archive/2026-04-05-issue-205.md
  code-review-results/archive/2026-04-05-issue-206.md
  code-review-results/archive/2026-04-05-issue-211.md
  code-review-results/archive/2026-04-05-issue-213.md
  code-review-results/archive/2026-04-05-issue-214.md
  code-review-results/archive/2026-04-06-issue-218.md
  code-review-results/archive/2026-04-06-issue-219.md
  code-review-results/archive/2026-04-06-issue-220.md
  code-review-results/archive/2026-04-06-issue-221.md
  code-review-results/archive/2026-04-06-issue-222.md

  # Architecture Decision Records
  docs/adr/README.md
  docs/adr/001-layered-architecture.md
  docs/adr/002-singleton-services-and-controllers.md
  docs/adr/003-custom-api-error-class.md
  docs/adr/004-standardized-api-response-wrapper.md
  docs/adr/005-joi-validation-via-middleware.md
  docs/adr/006-sequelize-factory-pattern-deferred-associations.md
  docs/adr/007-calculated-fields-via-sequelize-literal.md
  docs/adr/008-no-peer-service-imports.md
  docs/adr/009-url-path-api-versioning.md
  docs/adr/010-react-query-for-server-state.md
  docs/adr/011-service-hook-component-separation.md
  docs/adr/012-axios-singleton-with-interceptor.md
  docs/adr/013-material-design-3-token-system.md
  docs/adr/014-directory-per-component-with-barrel-exports.md
  docs/adr/015-loading-skeletons-over-spinners.md
  docs/adr/016-conditional-components-by-screen-size.md
  docs/adr/017-winston-structured-logging.md
  docs/adr/018-bash-startup-scripts-with-auto-setup.md
  docs/adr/019-environment-based-database-configuration.md
  docs/adr/020-sequelize-migrations-with-timestamp-naming.md
  docs/adr/021-middleware-ordering.md
  docs/adr/022-error-responses-through-apiresponse.md
  docs/adr/024-no-console-eslint-enforcement.md
  docs/adr/025-comprehensive-graceful-shutdown.md
  docs/adr/027-deep-health-check-with-database-connectivity.md
  docs/adr/028-standardized-validation-error-format.md
  docs/adr/030-cors-environment-configuration.md
  docs/adr/031-tiered-rate-limiting.md
  docs/adr/032-server-side-filtering-and-pagination.md
  docs/adr/033-jwt-authentication-httponly-cookies.md
  docs/adr/034-standardize-on-vitest.md
  docs/adr/035-typescript-frontend-migration.md
  docs/adr/036-react-hook-form.md
  docs/adr/037-default-parameters-over-defaultprops.md
  docs/adr/038-lower-request-body-size-limit.md
  docs/adr/039-joi-startup-environment-validation.md
  docs/adr/040-npm-workspaces-monorepo.md
)

# Directories to clean up after file removal (deepest first)
DIRS=(
  standards/full
  standards/quick-ref
  standards
  knowledge
  .claude/agents
  .claude/commands
  .claude/retrospectives/collaborated
  .claude/retrospectives
  .claude/temp
  scripts/lib
  scripts
  .husky/_
  .husky
  frontend/e2e/config
  frontend/e2e/fixtures
  frontend/e2e/page-objects
  frontend/e2e/smoke
  frontend/e2e/flow
  frontend/e2e/security
  frontend/e2e
  code-review-results/archive
  code-review-results
  docs/adr
  docs
)

echo "================================================"
echo "HARNESS REMOVAL SCRIPT"
echo "================================================"
echo ""
echo "This will permanently delete ${#FILES[@]} harness files."
echo "The files can be restored with: git checkout main -- <files>"
echo ""
echo "To confirm, type exactly: DANGER harness will be removed"
echo ""
read -r CONFIRMATION

if [ "$CONFIRMATION" != "DANGER harness will be removed" ]; then
  echo ""
  echo "Confirmation did not match. Aborting."
  exit 1
fi

echo ""
echo "Removing harness files..."

REMOVED=0
SKIPPED=0

for FILE in "${FILES[@]}"; do
  FULL_PATH="$PROJECT_ROOT/$FILE"
  if [ -f "$FULL_PATH" ]; then
    rm "$FULL_PATH"
    REMOVED=$((REMOVED + 1))
  else
    SKIPPED=$((SKIPPED + 1))
  fi
done

# Clean up empty directories
for DIR in "${DIRS[@]}"; do
  FULL_DIR="$PROJECT_ROOT/$DIR"
  if [ -d "$FULL_DIR" ] && [ -z "$(ls -A "$FULL_DIR" 2>/dev/null)" ]; then
    rmdir "$FULL_DIR"
  fi
done

echo ""
echo "================================================"
echo "HARNESS REMOVAL COMPLETE"
echo "================================================"
echo "  Removed: $REMOVED files"
echo "  Skipped: $SKIPPED (not found)"
echo ""
echo "NOTE: lint-staged config remains in package.json."
echo "To fully remove it, delete the \"lint-staged\" key"
echo "from package.json and run: npm uninstall lint-staged"
echo ""
echo "To restore the harness:"
echo "  git checkout main -- <files>"
echo "================================================"
