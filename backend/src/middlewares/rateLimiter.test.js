import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Tests for rateLimiter.js TEST_MODE branch.
 *
 * The module reads `process.env.TEST_MODE` at module-load time and chooses
 * between a no-op middleware and a real express-rate-limit instance. To
 * exercise both branches we mutate the env var, then `vi.resetModules()`
 * and dynamically re-import the module so the top-level branch re-runs.
 */
describe('rateLimiter TEST_MODE branch', () => {
  const originalTestMode = process.env.TEST_MODE;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (originalTestMode === undefined) {
      delete process.env.TEST_MODE;
    } else {
      process.env.TEST_MODE = originalTestMode;
    }
    vi.resetModules();
  });

  it('exports a no-op middleware when TEST_MODE=true (calls next without 429)', async () => {
    process.env.TEST_MODE = 'true';
    const { standardLimiter, strictLimiter } = await import('./rateLimiter.js');

    for (const limiter of [standardLimiter, strictLimiter]) {
      const next = vi.fn();
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      limiter({ ip: '1.2.3.4', method: 'GET', originalUrl: '/x' }, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    }
  });

  it('exports real express-rate-limit middleware when TEST_MODE is unset', async () => {
    delete process.env.TEST_MODE;
    const { standardLimiter, strictLimiter } = await import('./rateLimiter.js');

    // express-rate-limit attaches its own properties; the no-op is a plain
    // arrow function with no extra fields. Detect the difference via length
    // (no-op is `(req, res, next) => next()` so length === 3, real one also
    // length 3 — instead, check for the express-rate-limit `resetKey` method
    // attached to the returned middleware).
    expect(typeof standardLimiter.resetKey).toBe('function');
    expect(typeof strictLimiter.resetKey).toBe('function');
  });
});
