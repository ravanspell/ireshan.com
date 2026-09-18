import { ROUTES } from '@/lib/constants/routes';

/**
 * Post-login redirect safety.
 *
 * Kept free of Node APIs so the Edge middleware can import it.
 */

/**
 * Query parameter carrying the path a user was trying to reach when the
 * middleware bounced them to `/login`.
 */
export const NEXT_PARAM = 'next';

/**
 * Validate a post-login redirect target.
 *
 * The `next` value is attacker-controlled - anyone can hand out a link to
 * `/login?next=<anything>`, and an unvalidated redirect there would send a
 * user who just typed their password straight to an off-site copy of this
 * login page. So a value is only used once it has passed through here, and it
 * is re-checked server-side when the login succeeds rather than trusted after
 * a round trip through the browser.
 *
 * @param value - Raw `next` value from the query string
 * @returns The path if it is a safe same-origin destination, otherwise `null`
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;

  // Must be an absolute, same-origin path. `//evil.com` and `/\evil.com` are
  // protocol-relative URLs that browsers resolve off-site, and a backslash is
  // normalised to `/` before that resolution happens - so both have to be
  // rejected before a leading `/` can be read as "internal".
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//') || value.startsWith('/\\')) return null;

  // Control characters, CR/LF above all, can split headers downstream.
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;

  // Returning to /login after a successful login is an infinite loop.
  const [pathname] = value.split(/[?#]/);
  if (pathname === ROUTES.LOGIN) return null;

  return value;
}

/**
 * Resolve where a user should land now that they hold a session.
 *
 * Falls back to the editor rather than `ROUTES.ADMIN.DASHBOARD`, because
 * `/admin` currently has a layout but no `page.tsx` and so 404s.
 *
 * @param value - Raw `next` value from the query string, if any
 * @returns The validated destination, or the default landing page
 */
export function resolveNextPath(value: string | null | undefined): string {
  return safeNextPath(value) ?? ROUTES.ADMIN.EDITOR;
}
