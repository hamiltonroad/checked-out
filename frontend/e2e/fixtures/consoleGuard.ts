/**
 * Console + uncaught-error guard fixture (issue #241).
 *
 * HARNESS-E2E-CONSOLE-GUARD (issue #241)
 *
 * Every e2e spec under `frontend/e2e/{smoke,flow,security}/**` MUST
 * import `test` and `expect` from this module instead of from
 * `@playwright/test` directly. Enforcement is layered:
 *
 *   1. ESLint `no-restricted-imports` (frontend/eslint.config.js).
 *   2. Bash backstop (`scripts/check-e2e-console-guard.sh`).
 *   3. Runtime: this fixture asserts after each test that no
 *      console.error, page error, or unhandled promise rejection
 *      escaped through the allowlists.
 *
 * Allowlisted noise lives in:
 *   - `frontend/e2e/config/console-allowlist.ts`
 *   - `frontend/e2e/config/uncaughtErrorAllowlist.ts`
 *
 * Type-only imports of `Page`, `Locator`, etc. from `@playwright/test`
 * remain allowed in specs because they have no runtime impact.
 */
import { test as base, expect } from '@playwright/test';
import { isAllowlistedConsoleError } from '../config/console-allowlist';
import { isAllowlistedUncaughtError } from '../config/uncaughtErrorAllowlist';

interface WindowWithGuardBuffers extends Window {
  __unhandledRejections?: string[];
  __windowErrors?: string[];
}

/**
 * Auto fixture: every test that imports `test` from this file gets the
 * console/pageerror/unhandled-rejection guard installed automatically.
 */
export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const unhandledRejections: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!isAllowlistedConsoleError(text)) {
            consoleErrors.push(text);
          }
        }
      });

      page.on('pageerror', (err) => {
        const text = err.message;
        if (!isAllowlistedUncaughtError(text)) {
          pageErrors.push(text);
        }
      });

      // window.onerror + unhandledrejection fallback. React in dev mode
      // sometimes swallows render errors before `pageerror` fires; this
      // init script captures both buckets in-page so we can drain them
      // in afterEach.
      await page.addInitScript(() => {
        const w = window as unknown as WindowWithGuardBuffers;
        w.__unhandledRejections = w.__unhandledRejections || [];
        w.__windowErrors = w.__windowErrors || [];
        window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
          const reason = e.reason;
          let text: string;
          if (reason && typeof reason === 'object') {
            text = (reason as Error).stack || (reason as Error).message || String(reason);
          } else {
            text = String(reason);
          }
          (w.__unhandledRejections as string[]).push(text);
        });
        window.addEventListener('error', (e: ErrorEvent) => {
          (w.__windowErrors as string[]).push(e.message);
        });
      });

      await use();

      // Drain in-page buffers. Wrap in try/catch — page may already be
      // closed by the test body or by Playwright teardown.
      try {
        const drained = await page.evaluate(() => {
          const w = window as unknown as WindowWithGuardBuffers;
          const rejections = w.__unhandledRejections || [];
          const winErrors = w.__windowErrors || [];
          w.__unhandledRejections = [];
          w.__windowErrors = [];
          return { rejections, winErrors };
        });
        for (const r of drained.rejections) {
          if (!isAllowlistedUncaughtError(r)) {
            unhandledRejections.push(r);
          }
        }
        for (const w of drained.winErrors) {
          if (!isAllowlistedUncaughtError(w)) {
            pageErrors.push(w);
          }
        }
      } catch (err) {
        // Only swallow the documented "page/target closed" case — in
        // that branch the Playwright-side listeners (`page.on('console')`,
        // `page.on('pageerror')`) still captured anything that fired
        // during the test body. Any other drain failure (e.g. a bug in
        // the evaluator itself) must surface loudly so buffered in-page
        // errors are not lost silently.
        const message = err instanceof Error ? err.message : String(err);
        const isClosed =
          message.includes('Target page, context or browser has been closed') ||
          message.includes('Target closed') ||
          message.includes('page has been closed') ||
          message.includes('Execution context was destroyed');
        if (!isClosed) {
          throw err;
        }
      }

      expect(consoleErrors, `Console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
      expect(pageErrors, `Uncaught page errors:\n${pageErrors.join('\n')}`).toEqual([]);
      expect(
        unhandledRejections,
        `Unhandled promise rejections:\n${unhandledRejections.join('\n')}`
      ).toEqual([]);
    },
    { auto: true },
  ],
});

/**
 * Re-exported from `@playwright/test` solely so specs have a single
 * import source alongside the guarded `test`. Importing `expect` from
 * this file (instead of `@playwright/test` directly) keeps specs
 * compliant with the `no-restricted-imports` ESLint rule and the
 * `check-e2e-console-guard.sh` backstop (HARNESS-E2E-CONSOLE-GUARD).
 */
export { expect };
