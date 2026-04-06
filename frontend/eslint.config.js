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
])
