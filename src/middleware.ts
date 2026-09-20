import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@lib/supabase/middleware';
import { ROUTES, isPublicRoute } from '@/lib/constants/routes';
import { NEXT_PARAM, safeNextPath } from '@/lib/auth/redirect';

/**
 * Refreshes the Supabase session on non-public routes and redirects anonymous
 * visitors to /login, remembering where they were headed.
 *
 * Not an authorisation boundary: Server Actions POST to whatever route the
 * caller is on, so `PostService`/`TagService` authorise at the write instead.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export async function middleware(request: NextRequest) {
  // Public routes never build the Supabase client: this runs on every request,
  // and `createServerClient` replays whatever refresh token the cookies carry,
  // so a stale cookie logged `Invalid Refresh Token` on every /blog hit. Only
  // the session refresh is skipped, and authenticated calls refresh themselves.
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  const { supabase, getResponse } = await createClient(request);

  // A dead refresh token doesn't throw - Supabase retires the session in the
  // cookie store and those deletions ride out on the response below.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    // `clone()` carries the query string over; it belongs to the attempted
    // route, not to /login, so it is folded into `next` instead.
    url.search = '';

    const attempted = safeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`);
    if (attempted) {
      url.searchParams.set(NEXT_PARAM, attempted);
    }

    // A fresh response starts with no cookies, so Supabase's writes are copied
    // over by hand - otherwise the dead cookie survives the redirect.
    const redirect = NextResponse.redirect(url);
    for (const cookie of getResponse().cookies.getAll()) {
      redirect.cookies.set(cookie);
    }

    return redirect;
  }

  return getResponse();
}

export const config = {
  matcher: [
    /*
     * Everything except Next's internals, the favicon and `public/` assets.
     *
     * The extension list must keep `.txt` and `.xml`: crawlers are anonymous,
     * so while those were matched /robots.txt and /sitemap.xml answered with a
     * 307 to the login page's HTML, which Lighthouse parsed as robots syntax.
     * Excluding paths costs nothing - middleware grants no access (see above).
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)',
  ],
};
