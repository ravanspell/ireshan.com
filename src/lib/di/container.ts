import 'server-only';

import { bootstrapContainer } from './registry';
import type { Constructor } from './injectable';

/**
 * Dependency injection entry point.
 *
 * `registry.ts` decides what is registered and with which lifetime; this is the
 * sanctioned way to get something back out. Resolving through here rather than
 * touching tsyringe's `container` directly guarantees registration has run,
 * whatever import order the caller happens to have.
 */

/**
 * Resolves a registered controller, service or repository.
 *
 * Server-side only - this pulls in Prisma and the whole service graph. Call it
 * from Server Actions, Server Components or route handlers, never from a
 * `'use client'` module; the `server-only` import above fails the build if you
 * do.
 *
 * @param token The provider class to resolve.
 * @returns A fully wired instance, per the lifetime the class declares.
 * @throws If the class is not listed in `PROVIDERS`.
 *
 * @example
 * ```ts
 * const result = await resolve(PostController).getPublishedPosts();
 * ```
 */
export function resolve<T>(token: Constructor<T>): T {
  const container = bootstrapContainer();

  // tsyringe would otherwise auto-construct an unregistered class, handing back
  // an instance wired with its own `Db` - a second connection pool, silently.
  if (!container.isRegistered(token, true)) {
    throw new Error(
      `[di] ${token.name} is not registered. Add it to PROVIDERS in "@lib/di/registry".`,
    );
  }

  return container.resolve(token);
}
