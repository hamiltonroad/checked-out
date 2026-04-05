import { vi } from 'vitest';

/**
 * Creates a mock clipboard writeText function and installs it on navigator.
 * Call in beforeEach. Returns the mock for assertions.
 */
export function setupClipboardMock() {
  const mockWriteText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
  return mockWriteText;
}

/**
 * Installs a mock ResizeObserver on window.
 * Call in beforeEach.
 */
export function setupResizeObserverMock() {
  window.ResizeObserver = class MockResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  } as unknown as typeof ResizeObserver;
}
