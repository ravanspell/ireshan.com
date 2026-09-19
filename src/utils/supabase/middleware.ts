import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
