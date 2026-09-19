'use client';

import useSession from '@hooks/useSession';

/**
 * Boolean read of {@link useSession} - use that one when you also need the
 * user's name, email or avatar. Same caveats apply.
 *
 * @returns `null` while loading, then `true`/`false`. `null` keeps "unknown"
 * distinct from "anonymous"; `if (!isAuthenticated) return null` covers both.
 */
export function useIsAuthenticated(): boolean | null {
  const { status } = useSession();

  return status === 'loading' ? null : status === 'authenticated';
}

export default useIsAuthenticated;
