import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider, useThemeMode } from './ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.matchMedia
const createMatchMediaMock = (matches) =>
  vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with localStorage value when present (light)', () => {
      localStorageMock.getItem.mockReturnValue('light');
      window.matchMedia = createMatchMediaMock(true); // dark system preference

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('light');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('themeMode');
    });

    it('should initialize with localStorage value when present (dark)', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      window.matchMedia = createMatchMediaMock(false); // light system preference

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('dark');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('themeMode');
    });

    it('should fall back to system preference (dark) when no localStorage value', () => {
      localStorageMock.getItem.mockReturnValue(null);
      window.matchMedia = createMatchMediaMock(true); // dark system preference

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('dark');
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should fall back to system preference (light) when no localStorage value', () => {
      localStorageMock.getItem.mockReturnValue(null);
      window.matchMedia = createMatchMediaMock(false); // light system preference

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('light');
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should default to light mode when no localStorage and no system preference API', () => {
      localStorageMock.getItem.mockReturnValue(null);
      window.matchMedia = undefined;

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('light');
    });

    it('should ignore invalid localStorage values and fall back to system preference', () => {
      localStorageMock.getItem.mockReturnValue('invalid-mode');
      window.matchMedia = createMatchMediaMock(true);

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('dark');
    });
  });

  describe('toggleMode', () => {
    it('should toggle from light to dark', () => {
      localStorageMock.getItem.mockReturnValue('light');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('light');

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      window.matchMedia = createMatchMediaMock(true);

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('dark');

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe('light');
    });

    it('should persist mode change to localStorage (light to dark)', () => {
      localStorageMock.getItem.mockReturnValue('light');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      act(() => {
        result.current.toggleMode();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('themeMode', 'dark');
    });

    it('should persist mode change to localStorage (dark to light)', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      window.matchMedia = createMatchMediaMock(true);

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      act(() => {
        result.current.toggleMode();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('themeMode', 'light');
    });

    it('should toggle multiple times correctly', () => {
      localStorageMock.getItem.mockReturnValue('light');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result } = renderHook(() => useThemeMode(), { wrapper });

      expect(result.current.mode).toBe('light');

      act(() => {
        result.current.toggleMode();
      });
      expect(result.current.mode).toBe('dark');

      act(() => {
        result.current.toggleMode();
      });
      expect(result.current.mode).toBe('light');

      act(() => {
        result.current.toggleMode();
      });
      expect(result.current.mode).toBe('dark');

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Performance', () => {
    it('should maintain stable toggleMode reference across renders', () => {
      localStorageMock.getItem.mockReturnValue('light');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
      const { result, rerender } = renderHook(() => useThemeMode(), { wrapper });

      const firstToggleMode = result.current.toggleMode;

      // Toggle mode to trigger re-render
      act(() => {
        result.current.toggleMode();
      });

      rerender();

      const secondToggleMode = result.current.toggleMode;

      // toggleMode should be memoized with useCallback
      expect(firstToggleMode).toBe(secondToggleMode);
    });
  });
});

describe('useThemeMode', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should throw error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useThemeMode());
    }).toThrow('useThemeMode must be used within a ThemeProvider');

    consoleError.mockRestore();
  });

  it('should provide mode and toggleMode to consumers', () => {
    localStorageMock.getItem.mockReturnValue('light');
    window.matchMedia = createMatchMediaMock(false);

    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    expect(result.current).toHaveProperty('mode');
    expect(result.current).toHaveProperty('toggleMode');
    expect(typeof result.current.mode).toBe('string');
    expect(typeof result.current.toggleMode).toBe('function');
  });

  it('should return correct mode value', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    window.matchMedia = createMatchMediaMock(true);

    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    expect(result.current.mode).toBe('dark');
  });
});
