/**
 * Application Routes
 *
 * Centralized route definitions for the application.
 * Using constants ensures consistency and makes refactoring easier.
 *
 * @example
 * import { ROUTES } from '@/lib/constants/routes';
 * redirect(ROUTES.ADMIN.EDITOR);
 */

/**
 * The groupings below (`PUBLIC_ROUTES`, `ADMIN_ROUTES`, `BLOG_ROUTES`) are a
 * URL dictionary, organised for readability at call sites. They are **not**
 * the access policy - moving a path between them changes nothing about who
 * can reach it. `PUBLIC_ROUTE_ACCESS` at the bottom of this file is the only
 * thing that decides that.
 */

/**
 * Routes that are reachable without a session.
 */
export const PUBLIC_ROUTES = {
  /** Home page */
  HOME: '/',

  /** Login page */
  LOGIN: '/login',

  /** Authentication callback routes */
  AUTH: '/auth',

  /** Error page */
  ERROR: '/error',
} as const;

/**
 * Admin routes requiring authentication
 */
export const ADMIN_ROUTES = {
  /** Admin dashboard */
  DASHBOARD: '/admin',

  /** Blog editor, opened on a blank draft */
  EDITOR: '/admin/editor',

  /**
   * Open the editor on an existing post.
   * @param id - The post id
   * @returns The editor URL preloaded with that post
   */
  EDIT_POST: (id: string) => `${ADMIN_ROUTES.EDITOR}?id=${encodeURIComponent(id)}`,
} as const;

/**
 * Blog routes
 */
export const BLOG_ROUTES = {
  /** Blog listing page */
  INDEX: '/blog',

  /**
   * Generate a blog post URL from a slug
   * @param slug - The blog post slug
   * @returns The full blog post URL
   */
  POST: (slug: string) => `/blog/${slug}`,
} as const;

/**
 * All application routes combined
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ADMIN: ADMIN_ROUTES,
  BLOG: BLOG_ROUTES,
} as const;

/**
 * How a declared path is compared against an incoming pathname.
 *
 * - `exact`  - only that pathname. `/login` does not cover `/login/anything`.
 * - `prefix` - that pathname and everything nested under it. `/blog` covers
 *              `/blog/<slug>`; it still does not cover `/blogsomething`.
 */
export type RouteMatch = 'exact' | 'prefix';

export interface RouteAccess {
  readonly path: string;
  readonly match: RouteMatch;
}

/**
 * The access policy: every route reachable without a session, declared once.
 *
 * Deny-by-default - `isPublicRoute` is an allowlist, so a route that nobody
 * classifies is auth-gated. New routes therefore fail closed.
 *
 * Note this governs *page* requests only. Server Actions POST to whatever
 * route the caller is already on, so a pathname check can never authorise
 * them; `PostService`/`TagService` enforce that at the write instead.
 */
export const PUBLIC_ROUTE_ACCESS: readonly RouteAccess[] = [
  // `exact`, not `prefix`: '/' is a prefix of every path on the site, so
  // matching it by prefix would make the whole application public.
  { path: ROUTES.HOME, match: 'exact' },
  { path: ROUTES.LOGIN, match: 'exact' },
  // Supabase redirects land on nested paths, e.g. /auth/callback, /auth/confirm.
  { path: ROUTES.AUTH, match: 'prefix' },
  { path: ROUTES.ERROR, match: 'exact' },
  // The listing plus every post at /blog/<slug>.
  { path: ROUTES.BLOG.INDEX, match: 'prefix' },
];

/**
 * Check if a given path is reachable without authentication.
 *
 * @param path - The pathname to check (no query string)
 * @returns true if the path is public, false if it requires a session
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTE_ACCESS.some(({ path: publicPath, match }) =>
    match === 'exact'
      ? path === publicPath
      : path === publicPath || path.startsWith(`${publicPath}/`),
  );
}
