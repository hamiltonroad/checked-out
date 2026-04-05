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
  // Smoke tests run in Node.js (Playwright)
  {
    files: ['smoke/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
