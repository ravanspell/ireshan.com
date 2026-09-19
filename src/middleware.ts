import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';
import { ROUTES, isPublicRoute } from '@/lib/constants/routes';
import { NEXT_PARAM, safeNextPath } from '@/lib/auth/redirect';

/**
 * Next.js Middleware
 *
 * Handles authentication for all routes using Supabase.
 * - Checks if user is authenticated
 * - Redirects unauthenticated users to login (except for public routes)
 * - Refreshes the session if needed
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export async function middleware(request: NextRequest) {
  // Public routes skip Supabase entirely - the client is never even built.
  // This runs on every request, so `getUser()` for anonymous visitors reading
  // the blog is a network hop per page view for an answer nobody uses. Building
  // the client alone costs one too: `createServerClient` registers an
  // auth-state subscriber that replays whatever refresh token the cookies
  // carry, so a stale cookie logged `Invalid Refresh Token` on every /blog hit.
  //
  // Safe because middleware is no longer load-bearing for authorisation:
  // Server Actions POST to whatever route the caller is on, so pathname checks
  // never protected them - `PostService`/`TagService` enforce it at the write.
  // The only thing skipped is the session refresh, and any authenticated call
  // builds its own Supabase client and refreshes there.
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  const { supabase, getResponse } = await createClient(request);

  // Refresh session if expired - required for Server Components. A dead refresh
  // token is not thrown: Supabase retires the session in the cookie store, and
  // those deletions ride out on the response below.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect unauthenticated users to login page, remembering where they
    // were headed so the login can hand them back to it.
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    // `clone()` carries the original query string over; it belongs to the
    // attempted route, not to /login, so it is folded into `next` instead.
    url.search = '';

    const attempted = safeNextPath(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    if (attempted) {
      url.searchParams.set(NEXT_PARAM, attempted);
    }

    // A fresh response starts with no cookies, so Supabase's writes have to be
    // carried over by hand - otherwise the dead cookie survives the redirect
    // and fails again on every request after it.
    const redirect = NextResponse.redirect(url);
    for (const cookie of getResponse().cookies.getAll()) {
      redirect.cookies.set(cookie);
    }

    return redirect;
  }

  return getResponse();
}

/**
 * Middleware Configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files served from `public/` by extension
     *
     * The extension list must cover `.txt` and `.xml`. Middleware redirects any
     * unmatched path to /login for anonymous visitors, and crawlers are always
     * anonymous - so while these were matched, /robots.txt and /sitemap.xml
     * answered a crawler with a 307 to the login page's HTML. Lighthouse read
     * that HTML as robots syntax and reported one error per line.
     *
     * Excluding them costs nothing: middleware is not the authorisation
     * boundary (see the note above), so a path bypassing it grants no access.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)',
  ],
};
