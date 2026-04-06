/**
 * Centralized console-error allowlist for e2e smoke tests.
 *
 * Rules (enforced by `frontend/e2e/config/allowlist.test.ts`):
 * - Every entry MUST be a plain string literal — no `RegExp`, no broad
 *   substrings, no case-insensitive matches.
 * - Entries are matched against `msg.text()` using exact equality OR
 *   exact-prefix equality via `startsWith(entry)`. Substring `includes`
 *   matching is forbidden because it silently hides real crashes (e.g.
 *   a substring of "auth" would mask `AuthProvider` React errors).
 * - Entries must be >= 10 characters to prevent short ambiguous prefixes.
 *
 * When adding an entry, paste the EXACT console text produced by the
 * error, not a paraphrase. If the message contains a dynamic value
 * (request id, URL) truncate to a stable leading prefix of at least
 * 10 characters and add a comment explaining the tail you stripped.
 */
export const consoleErrorAllowlist: readonly string[] = [
  // 401 responses from unauthenticated bootstrap calls on the public
  // landing page. Full message: "Failed to load resource: the server
  // responded with a status of 401 (Unauthorized)" — Chromium emits the
  // "401 (Unauthorized)" suffix verbatim.
  'Failed to load resource: the server responded with a status of 401 (Unauthorized)',
];

/**
 * Returns true if `message` matches any allowlist entry via exact
 * equality or exact prefix (startsWith). Substring matching is
 * intentionally NOT supported.
 */
export function isAllowlistedConsoleError(message: string): boolean {
  return consoleErrorAllowlist.some(
    (entry) => message === entry || message.startsWith(entry)
  );
}
