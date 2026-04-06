import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-hooks/exhaustive-deps': 'error',
      'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../services/*', '../../services/*', '../../../services/*', '*/services/*'],
          message: 'Do not import services directly in components. Use hooks instead (see CLAUDE.md).',
        }],
      }],
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'max-lines': 'off',
      'no-restricted-imports': 'off',
    },
  },
  // Type, config, and theme files are exempt from max-lines
  {
    files: ['**/types/**/*.ts', '**/theme/**/*.ts', '**/config/**/*.ts'],
    rules: {
      'max-lines': 'off',
    },
  },
  // Hooks and context files may import services directly
  {
    files: ['**/hooks/**/*.{ts,tsx}', '**/context/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // HARNESS-DEV-PASSWORD-LITERAL (issue #230)
  // Ban the literal 'welcome123' anywhere except testData.ts (the single
  // shared fixture re-exporting from backend/src/config/auth.js semantics).
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/e2e/fixtures/testData.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value='welcome123']",
          message:
            '[HARNESS-DEV-PASSWORD-LITERAL issue #230] Import DEV_PASSWORD from frontend/e2e/fixtures/testData.ts (the single shared source) — do not repeat the literal.',
        },
      ],
    },
  },
  // Ban raw role string literals project-wide (Issue #228 Rec #2).
  // Whitelisted: src/utils/roles.ts (the canonical source) and test files.
  // Project-wide ban catches AppRouter.tsx, ProtectedRoute*, and any future guard-like file
  // without requiring continual glob maintenance.
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: [
      '**/utils/roles.ts',
      '**/types/**/*.{ts,tsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/e2e/**',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^(admin|librarian|patron|staff|system_admin)$/]",
          message:
            'Use role constants from src/utils/roles.ts (ROLES.ADMIN, etc.) instead of raw role string literals.',
        },
      ],
    },
  },
  // Ban envelope-fallback patterns (`res.data || res`) in services and hooks (Issue #228 Rec #5).
  // Trust the ApiResponse envelope or throw — never fall back to the raw payload.
  {
    files: ['**/services/**/*.{ts,tsx,js,jsx}', '**/hooks/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // Matches any `<expr>.data || <anything>` — Identifier, MemberExpression,
          // ObjectExpression ({}), ArrayExpression ([]), CallExpression, Literal.
          selector:
            "LogicalExpression[operator='||'][left.type='MemberExpression'][left.property.name='data']",
          message:
            'Do not fall back to a default when ApiResponse data is missing — trust the envelope or throw. See standards/quick-ref/backend-quick-ref.md ApiResponse section.',
        },
      ],
    },
  },
  // Enforce no-magic-numbers in services/hooks/pages (Issue #228 Rec #6). Scoped narrowly + warn-only.
  {
    files: ['**/services/**/*.{ts,tsx,js,jsx}', '**/hooks/**/*.{ts,tsx,js,jsx}', '**/pages/**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    rules: {
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: true,
        },
      ],
    },
  },
  // E2E tests run in Node.js (Playwright)
  {
    files: ['e2e/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  // E2E spec-file quality rules (issue #229).
  // Scoped to the actual spec directories used by this repo
  // (smoke/, security/, flow/) rather than a specs/ folder.
  {
    files: ['e2e/{smoke,security,flow}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name='waitForLoadState'][arguments.0.value='networkidle']",
          message:
            'networkidle is flaky — use waitForResponse against a specific endpoint or a Locator assertion (issue #229 item #7).',
        },
        {
          // Identifier substring rule. Matches `cookieName.includes('csrf')`,
          // `urlPath.includes('/foo')`, `pathname.includes('/foo')`, etc.
          // Does NOT match `resp.url().includes(...)` because callee.object
          // there is a CallExpression, not an Identifier — `waitForResponse`
          // filter callbacks remain legal.
          selector:
            "CallExpression[callee.property.name='includes'][callee.object.type='Identifier'][callee.object.name=/cookie|url|pathname/i]",
          message:
            'Identifier assertions (URLs, cookies, paths) must be exact-match, not substring .includes() (issue #229 item #9).',
        },
        {
          // Shorthand property keys: `{ copy_id: 1 }` / `{ patronId: 5 }`.
          selector:
            "Property[key.type='Identifier'][key.name=/_id$|Id$|ID$/][value.type='Literal'][value.raw=/^[0-9]+$/]",
          message:
            'Do not hardcode database ids in e2e specs. Use fixtures/seed.ts helpers (issue #229 item #12).',
        },
        {
          // String-keyed property literals: `{ 'copy_id': 1 }`.
          selector:
            "Property[key.type='Literal'][key.value=/_id$|Id$|ID$/][value.type='Literal'][value.raw=/^[0-9]+$/]",
          message:
            'Do not hardcode database ids in e2e specs. Use fixtures/seed.ts helpers (issue #229 item #12).',
        },
        {
          // Direct fetch() to mutation endpoints.
          selector:
            "CallExpression[callee.name='fetch'] > Literal[value=/^\\u002Fapi\\u002F(copies|patrons|checkouts)/]",
          message:
            'Specs must not call mutation APIs directly — use fixtures/seed.ts helpers (issue #229 item #13).',
        },
        {
          // page.request.{post,put,patch,delete}('/api/...') — Playwright APIRequestContext.
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.type='MemberExpression'][callee.object.property.name='request'][callee.property.name=/^(post|put|patch|delete)$/] > Literal:first-child[value=/(copies|patrons|checkouts)/]",
          message:
            'Specs must not call mutation APIs directly via page.request — use fixtures/seed.ts helpers (issue #229 item #13).',
        },
        {
          // session.request('POST', 'checkouts', ...) — internal ApiSession helper.
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.property.name='request'][arguments.0.type='Literal'][arguments.0.value=/^(POST|PUT|PATCH|DELETE)$/][arguments.1.type='Literal'][arguments.1.value=/(copies|patrons|checkouts)/]",
          message:
            'Specs must not call mutation APIs directly via ApiSession — use fixtures/seed.ts helpers (issue #229 item #13).',
        },
        {
          // MUI class-name selectors in specs (also enforced in page-objects below).
          selector: "Literal[value=/\\.Mui[A-Z]/]",
          message:
            'Do not select by MUI class names — use getByRole, labels, or data-testid (issue #229 item #11).',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/helpers/auth', '**/helpers/csrf'],
              message:
                'Specs must import auth/csrf setup from frontend/e2e/fixtures/, not helpers/ (issue #229 item #10).',
            },
          ],
        },
      ],
      'max-lines': [
        'error',
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  // Page objects must not couple to MUI internal class names (issue #229 item #11).
  {
    files: ['e2e/page-objects/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/\\.Mui[A-Z]/]",
          message:
            'Page objects must use getByRole, labels, or data-testid — not MUI class names (issue #229 item #11).',
        },
      ],
    },
  },
])
