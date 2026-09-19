'use client';

import { useSyncExternalStore } from 'react';
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeToSession,
  type SessionSnapshot,
  type SessionStatus,
  type SessionUser,
} from '@lib/auth/session-store';

export type { SessionSnapshot, SessionStatus, SessionUser };

export interface UseSessionResult extends SessionSnapshot {
  isAuthenticated: boolean;
  /** Still in flight - render nothing session-dependent. */
  isLoading: boolean;
}

/**
 * Who is signed in, resolved in the browser. All consumers share one
 * round-trip (see `@lib/auth/session-store`).
 *
 * Only for chrome a cached page must not bake in - the public ISR routes,
 * where reading `cookies()` on the server would kill static rendering. On
 * `/admin/**`, already dynamic, read the user via `AuthController` and pass it
 * as a prop: authoritative, no round-trip, correct on first paint.
 */
export function useSession(): UseSessionResult {
  const snapshot = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  return {
    ...snapshot,
    isAuthenticated: snapshot.status === 'authenticated',
    isLoading: snapshot.status === 'loading',
  };
}

export default useSession;
