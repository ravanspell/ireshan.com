import { isAuthApiError, isAuthSessionMissingError } from '@supabase/supabase-js';

/**
 * Codes meaning "this browser is not signed in any more", not "something broke".
 *
 * Supabase rotates the refresh token on every use, so a browser holding a
 * superseded copy gets one of these back from `/token`. It is the expected
 * answer for a dead session; the only correct response is to treat the request
 * as anonymous.
 */
const DEAD_SESSION_CODES: ReadonlySet<string> = new Set([
  'refresh_token_not_found',
  'refresh_token_already_used',
  'session_expired',
  'session_not_found',
]);

/**
 * True when the session is definitively dead.
 *
 * Deliberately narrow - a transient failure (retryable fetch, 5xx, timeout) is
 * not a dead session, and callers use this to decide whether to throw the auth
 * cookies away. Widening it signs out valid users on a network blip.
 */
export function isDeadSessionError(error: unknown): boolean {
  return isAuthApiError(error) && !!error.code && DEAD_SESSION_CODES.has(error.code);
}

/**
 * True when the error just means "no authenticated user" - never had a session,
 * or the dead session above. Anything this rejects is a genuine surprise.
 */
export function isSignedOutError(error: unknown): boolean {
  return isAuthSessionMissingError(error) || isDeadSessionError(error);
}
