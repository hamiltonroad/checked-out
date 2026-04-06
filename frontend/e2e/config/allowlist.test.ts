import { test, expect } from '@playwright/test';
import { consoleErrorAllowlist } from './console-allowlist';

/**
 * Guard test for the console-error allowlist (issue #229, item #8).
 *
 * Asserts every entry is a plain string, long enough to be specific,
 * and does not look like a regex or a case-insensitive substring. This
 * prevents regressions like `/auth/i`, which would silently hide
 * `AuthProvider` crashes.
 */
test.describe('console-error allowlist integrity', () => {
  test('every entry is a plain string (no RegExp)', () => {
    for (const entry of consoleErrorAllowlist) {
      expect(typeof entry).toBe('string');
    }
  });

  test('no entry looks like a regex literal', () => {
    for (const entry of consoleErrorAllowlist) {
      expect(entry.startsWith('/')).toBe(false);
      expect(entry.endsWith('/i')).toBe(false);
      expect(entry.endsWith('/')).toBe(false);
    }
  });

  test('every entry is at least 10 characters (no short substrings)', () => {
    for (const entry of consoleErrorAllowlist) {
      expect(entry.length).toBeGreaterThanOrEqual(10);
    }
  });

  test('no entry contains regex-only metacharacters (anchors, quantifiers, alternation)', () => {
    // Parens, brackets, and braces are allowed because they legitimately
    // appear in browser error messages (e.g. "status of 401 (Unauthorized)").
    // We only ban characters that have no meaning in a literal prefix
    // match and would silently turn an entry into a broad pattern if
    // anyone ever switches to regex matching.
    const regexOnly = /[\\^$*+?|]/;
    for (const entry of consoleErrorAllowlist) {
      expect(regexOnly.test(entry)).toBe(false);
    }
  });
});
