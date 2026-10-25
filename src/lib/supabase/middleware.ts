import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_OPTIONS } from './session-policy';

/**
 * Create Supabase Client for Middleware
 *
 * Creates a Supabase client specifically for use in Next.js middleware.
 * Handles cookies correctly for the middleware environment.
 *
 * Returns an accessor, not a response: `setAll` runs during `getUser()` - after
 * this function returns - and *replaces* the response rather than mutating it.
 * A returned response would be the pre-`setAll` one, losing every cookie
 * Supabase wrote. Call `getResponse()` after the last `supabase.auth.*` call.
 *
 * @param request - The Next.js request object
 * @returns The Supabase client, and an accessor for the current response
 */
export async function createClient(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, getResponse: () => response };
}

/**
 * Re-issues the request's auth cookies on `response` with a fresh `maxAge`,
 * turning the cookie lifetime into an idle timeout. Supabase only writes them
 * on a token refresh, so without this an active session would still drop when
 * the cookie set at the last refresh runs out.
 *
 * Cookies Supabase already wrote to `response` this request (a refresh, or the
 * deletions of a dead session) are left alone - they are newer than ours.
 */
export function slideAuthCookies(request: NextRequest, response: NextResponse) {
  for (const { name, value } of request.cookies.getAll()) {
    if (!name.startsWith('sb-') || !name.includes('-auth-token')) continue;
    if (response.cookies.has(name)) continue;

    response.cookies.set(name, value, AUTH_COOKIE_OPTIONS);
  }
}
