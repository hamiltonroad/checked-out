import { render, screen, act } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import { useOverflowDetection } from './useOverflowDetection';

/** Test component that attaches the overflow ref to a div */
function TestComponent({ testId = 'overflow-target' }: { testId?: string }) {
  const { contentRef, isOverflowing } = useOverflowDetection();
  return (
    <div>
      <div ref={contentRef} data-testid={testId}>
        Content
      </div>
      <span data-testid="result">{isOverflowing ? 'overflowing' : 'fits'}</span>
    </div>
  );
}

describe('useOverflowDetection', () => {
  let observeCallbacks: Array<() => void>;
  let mockObserve: Mock;
  let mockDisconnect: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    observeCallbacks = [];
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();
    window.ResizeObserver = class MockResizeObserver {
      constructor(callback: (...args: unknown[]) => void) {
        observeCallbacks.push(callback as unknown as () => void);
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
    } as unknown as typeof ResizeObserver;
  });

  it('should return isOverflowing false when content fits', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('result').textContent).toBe('fits');
  });

  it('should observe the referenced element', () => {
    render(<TestComponent />);
    expect(mockObserve).toHaveBeenCalledWith(screen.getByTestId('overflow-target'));
  });

  it('should detect overflow when scrollHeight exceeds clientHeight', () => {
    render(<TestComponent />);
    const target = screen.getByTestId('overflow-target');

    Object.defineProperty(target, 'scrollHeight', { value: 200, configurable: true });
    Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });

    act(() => {
      observeCallbacks.forEach((cb) => cb());
    });

    expect(screen.getByTestId('result').textContent).toBe('overflowing');
  });

  it('should detect overflow when scrollWidth exceeds clientWidth', () => {
    render(<TestComponent />);
    const target = screen.getByTestId('overflow-target');

    Object.defineProperty(target, 'scrollWidth', { value: 200, configurable: true });
    Object.defineProperty(target, 'clientWidth', { value: 100, configurable: true });

    act(() => {
      observeCallbacks.forEach((cb) => cb());
    });

    expect(screen.getByTestId('result').textContent).toBe('overflowing');
  });

  it('should not detect overflow when dimensions match', () => {
    render(<TestComponent />);
    const target = screen.getByTestId('overflow-target');

    Object.defineProperty(target, 'scrollHeight', { value: 100, configurable: true });
    Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(target, 'scrollWidth', { value: 100, configurable: true });
    Object.defineProperty(target, 'clientWidth', { value: 100, configurable: true });

    act(() => {
      observeCallbacks.forEach((cb) => cb());
    });

    expect(screen.getByTestId('result').textContent).toBe('fits');
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = render(<TestComponent />);
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
