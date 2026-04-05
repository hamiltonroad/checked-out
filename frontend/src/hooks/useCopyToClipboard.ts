import { useState, useEffect, useRef, useCallback } from 'react';

const COPY_FEEDBACK_DURATION_MS = 2000;

interface UseCopyToClipboardReturn {
  copyToClipboard: (text: string) => Promise<void>;
  isCopied: boolean;
}

/**
 * Provides clipboard copy functionality with visual feedback state.
 * Sets isCopied to true for 2 seconds after a successful copy.
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
        timeoutRef.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      setIsCopied(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copyToClipboard, isCopied };
}
