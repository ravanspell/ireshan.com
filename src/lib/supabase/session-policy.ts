import type { CookieOptions } from '@supabase/ssr';
import type { JwtPayload } from '@supabase/supabase-js';

/**
 * How long a sign-in may last, enforced on our side because Supabase's own
 * session time-box and inactivity timeout are Pro-plan settings. Left alone,
 * the refresh token never expires and `@supabase/ssr` keeps the cookie for 400
 * days, so a session lives as long as it's used once a year.
 *
 * Shared by all three client factories, and free of `server-only` because
 * `client.ts` runs in the browser.
 */

/** Absolute limit from sign-in, however active the session is. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

/**
 * Idle limit: the auth cookie's lifetime. Middleware re-issues it on every
 * authenticated request, so it slides with activity; Supabase only rewrites it
 * on a token refresh (about hourly), which alone would make it absolute.
 */
export const SESSION_IDLE_SECONDS = 60 * 60;

/** `@supabase/ssr`'s defaults with our `maxAge` in place of its 400 days. */
export const AUTH_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax',
  httpOnly: false,
  maxAge: SESSION_IDLE_SECONDS,
} satisfies CookieOptions;

/**
 * True when the sign-in behind these claims is older than the absolute limit.
 *
 * Reads the `amr` timestamp, not `iat`: a token refresh mints a new `iat` but
 * carries the original authentication time forward. Claims without a
 * timestamp (the RFC-8176 string form) fall back to `iat`, which at worst
 * makes the limit slide like the idle one rather than signing anyone out.
 */
export function isSessionPastMaxAge(claims: JwtPayload, now = Date.now()): boolean {
  const timestamps = (claims.amr ?? []).flatMap((entry) =>
    typeof entry === 'string' ? [] : [entry.timestamp],
  );
  const signedInAt = timestamps.length > 0 ? Math.min(...timestamps) : claims.iat;

  return now - signedInAt * 1000 > SESSION_MAX_AGE_SECONDS * 1000;
}
