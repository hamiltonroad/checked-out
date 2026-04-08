/**
 * Centralized uncaught-error allowlist for e2e tests (issue #241).
 *
 * Used by `frontend/e2e/fixtures/consoleGuard.ts` to filter `pageerror`
 * events and unhandled promise rejections captured during a test.
 *
 * Rules (mirrors `console-allowlist.ts` and enforced by
 * `frontend/e2e/config/allowlist.test.ts`):
 * - Every entry MUST be a plain string literal — no `RegExp`, no broad
 *   substrings, no case-insensitive matches.
 * - Entries are matched against the error `message`/stringified reason
 *   using exact equality OR exact-prefix equality via `startsWith(entry)`.
 *   Substring `includes` matching is forbidden because it silently hides
 *   real crashes.
 * - Entries must be >= 10 characters to prevent short ambiguous prefixes.
 *
 * When adding an entry, paste the EXACT error text produced at runtime,
 * not a paraphrase. If the message contains a dynamic value (request id,
 * URL) truncate to a stable leading prefix of at least 10 characters and
 * add a comment explaining the tail you stripped.
 *
 * Starts empty by design — additions should be exceptional and reviewed.
 */
export const uncaughtErrorAllowlist: readonly string[] = [];

/**
 * Returns true if `message` matches any allowlist entry via exact
 * equality or exact prefix (startsWith). Substring matching is
 * intentionally NOT supported.
 */
export function isAllowlistedUncaughtError(message: string): boolean {
  return uncaughtErrorAllowlist.some((entry) => message === entry || message.startsWith(entry));
}
