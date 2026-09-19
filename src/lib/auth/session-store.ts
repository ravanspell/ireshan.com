import { createClient } from '@/utils/supabase/client';

/**
 * Browser-side session store: one client, one `getUser()` and one
 * `onAuthStateChange` per tab, shared by every consumer.
 *
 * A module store rather than a context, so a leaf can subscribe without
 * wrapping the tree in a provider - which would opt `/blog` out of static
 * rendering.
 *
 * Presentation only. `middleware.ts` gates pages and `AuthService` gates every
 * mutation; a tampered snapshot buys a link that redirects to `/login`.
 */

/** The fields a UI may show. Nothing sensitive. */
export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

/** `loading` is distinct so callers can render nothing instead of flashing. */
export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export interface SessionSnapshot {
  status: SessionStatus;
  user: SessionUser | null;
}

// Reused, never rebuilt: `useSyncExternalStore` re-renders on every new
// reference `getSnapshot()` hands back.
const LOADING: SessionSnapshot = Object.freeze({ status: 'loading', user: null });
const ANONYMOUS: SessionSnapshot = Object.freeze({ status: 'anonymous', user: null });

let snapshot: SessionSnapshot = LOADING;
let started = false;

const listeners = new Set<() => void>();

function toSessionUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): SessionUser {
  const meta = user.user_metadata ?? {};
  const fullName = (meta.full_name ?? meta.name) as string | undefined;

  return {
    id: user.id,
    email: user.email ?? null,
    name: fullName ?? user.email?.split('@')[0] ?? null,
    avatarUrl: (meta.avatar_url as string | undefined) ?? null,
  };
}

function publish(next: SessionSnapshot) {
  // Swap only on a real change, so a token refresh re-renders nobody.
  if (next.status === snapshot.status && next.user?.id === snapshot.user?.id) return;

  snapshot = next;
  listeners.forEach((listener) => listener());
}

/** Starts once per tab, and is never torn down - the warm snapshot avoids a
 *  `loading` flash on the next navigation. */
function start() {
  if (started) return;
  started = true;

  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    // No public env vars (Storybook, previews). Cosmetic state must not throw.
    publish(ANONYMOUS);
    return;
  }

  // `getUser()` over `getSession()`: it revalidates, so an expired cookie
  // doesn't leave admin chrome on screen.
  supabase.auth
    .getUser()
    .then(({ data }) => {
      publish(data.user ? { status: 'authenticated', user: toSessionUser(data.user) } : ANONYMOUS);
    })
    .catch(() => publish(ANONYMOUS));

  supabase.auth.onAuthStateChange((_event, session) => {
    publish(
      session?.user ? { status: 'authenticated', user: toSessionUser(session.user) } : ANONYMOUS,
    );
  });
}

export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener);
  start();

  return () => {
    listeners.delete(listener);
  };
}

export function getSessionSnapshot(): SessionSnapshot {
  return snapshot;
}

/** Always `loading`: this render is cached and shared, so it can never claim a user. */
export function getServerSessionSnapshot(): SessionSnapshot {
  return LOADING;
}
