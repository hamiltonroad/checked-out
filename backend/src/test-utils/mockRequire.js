import { createRequire } from 'module';

/**
 * Create a CJS require function and inject mocks into Node's require cache.
 *
 * Vitest cannot intercept CJS require() calls in source files. This utility
 * injects mock modules into Node's require.cache so that when CJS source
 * files call require(), they receive the mock instead of the real module.
 *
 * Usage:
 *   const { require, injectMock } = setupMockRequire(import.meta.url);
 *   injectMock('../models', { Book: { findAll: vi.fn() } });
 *   const service = require('./myService');
 *
 * @param {string} importMetaUrl - The import.meta.url of the calling test file
 * @returns {{ require: NodeRequire, injectMock: Function }}
 */
// eslint-disable-next-line import/prefer-default-export
export function setupMockRequire(importMetaUrl) {
  const cjsRequire = createRequire(importMetaUrl);

  function injectMock(modulePath, exports) {
    const resolvedPath = cjsRequire.resolve(modulePath);
    cjsRequire.cache[resolvedPath] = {
      id: resolvedPath,
      filename: resolvedPath,
      loaded: true,
      exports,
    };
  }

  return { require: cjsRequire, injectMock };
}
