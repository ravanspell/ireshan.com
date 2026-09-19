'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if the component is mounted on the client
 *
 * Useful for avoiding hydration errors or running code only on the client side.
 *
 * @returns `true` if component is mounted, `false` otherwise
 *
 * @example
 * const isMounted = useIsMounted();
 * if (isMounted) {
 *   safe to access window or DOM
 * }
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after first render
    setIsMounted(true);
  }, []);

  return isMounted;
}
