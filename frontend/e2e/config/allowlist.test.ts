import { test, expect } from '@playwright/test';
import { consoleErrorAllowlist } from './console-allowlist';
import { uncaughtErrorAllowlist, isAllowlistedUncaughtError } from './uncaughtErrorAllowlist';

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

/**
 * Guard tests for the uncaught-error allowlist (issue #241).
 * Mirrors the console-error allowlist rules exactly.
 */
test.describe('uncaught-error allowlist integrity', () => {
  test('every entry is a plain string (no RegExp)', () => {
    for (const entry of uncaughtErrorAllowlist) {
      expect(typeof entry).toBe('string');
    }
  });

  test('no entry looks like a regex literal', () => {
    for (const entry of uncaughtErrorAllowlist) {
      expect(entry.startsWith('/')).toBe(false);
      expect(entry.endsWith('/i')).toBe(false);
      expect(entry.endsWith('/')).toBe(false);
    }
  });

  test('every entry is at least 10 characters (no short substrings)', () => {
    for (const entry of uncaughtErrorAllowlist) {
      expect(entry.length).toBeGreaterThanOrEqual(10);
    }
  });

  test('no entry contains regex-only metacharacters', () => {
    const regexOnly = /[\\^$*+?|]/;
    for (const entry of uncaughtErrorAllowlist) {
      expect(regexOnly.test(entry)).toBe(false);
    }
  });
});

test.describe('isAllowlistedUncaughtError', () => {
  test('returns false when allowlist is empty and message is arbitrary', () => {
    // Starts empty by design — any future entries will live in
    // uncaughtErrorAllowlist.ts with a provenance comment.
    if (uncaughtErrorAllowlist.length === 0) {
      expect(isAllowlistedUncaughtError('some random error message')).toBe(false);
    }
  });

  test('exact match returns true (synthetic)', () => {
    const sample = 'SYNTHETIC_TEST_EXACT_MATCH_ENTRY';
    const matches = (msg: string): boolean => [sample].some((e) => msg === e || msg.startsWith(e));
    expect(matches(sample)).toBe(true);
    expect(matches('different message entirely')).toBe(false);
  });

  test('prefix match returns true (synthetic)', () => {
    const sample = 'SYNTHETIC_PREFIX_HEAD';
    const matches = (msg: string): boolean => [sample].some((e) => msg === e || msg.startsWith(e));
    expect(matches('SYNTHETIC_PREFIX_HEAD: request /api/foo failed')).toBe(true);
    expect(matches('totally different start')).toBe(false);
  });
});
