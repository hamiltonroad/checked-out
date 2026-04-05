import { useRef, useState, useEffect, useCallback, type RefObject } from 'react';

interface UseOverflowDetectionReturn {
  contentRef: RefObject<HTMLElement | null>;
  isOverflowing: boolean;
}

/**
 * Detects whether an element's content overflows its container.
 * Uses ResizeObserver to re-evaluate on layout changes.
 */
export function useOverflowDetection(): UseOverflowDetectionReturn {
  const contentRef = useRef<HTMLElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    checkOverflow();

    const observer = new ResizeObserver(() => {
      checkOverflow();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [checkOverflow]);

  return { contentRef, isOverflowing };
}
