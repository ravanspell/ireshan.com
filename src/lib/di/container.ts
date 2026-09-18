import 'server-only';

import type { DependencyContainer } from 'tsyringe';
import { bootstrapContainer } from './registry';

/**
 * Dependency Injection entry point.
 *
 * `registry.ts` is the composition root (what is registered, and with which
 * lifecycle); this file is the only sanctioned way to get something out of it.
 * Resolving through `resolve()` rather than importing tsyringe's `container`
 * directly guarantees registration has run first, whatever import order the
 * caller happens to have.
 */

// Bootstrap eagerly on import, and again defensively per resolve - both are
// no-ops after the first call.
const container = bootstrapContainer();

/**
 * Resolve a registered controller, service or repository.
 *
 * Server-side only: this pulls in Prisma and the whole service graph. Call it
 * from Server Actions, Server Components or route handlers - never from a
 * `'use client'` module (the `server-only` import above will fail the build).
 *
 * @example
 * const postController = resolve(PostController);
 * const result = await postController.createPost(formData, authorId);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve<T>(token: new (...args: any[]) => T): T {
  const c = bootstrapContainer();

  // tsyringe happily auto-constructs an unregistered class, which would hand
  // back an instance wired with its own fresh `Db` - a second connection pool,
  // silently. Fail loudly instead.
  if (!c.isRegistered(token, true)) {
    throw new Error(
      `[di] ${token.name} is not registered. Add it to PROVIDERS in "@lib/di/registry".`,
    );
  }

  return c.resolve(token);
}

/**
 * Escape hatch for wiring that `resolve()` cannot express - registering test
 * doubles, or creating a child container for a scoped override.
 *
 * Prefer constructor injection over reaching for this: a class that resolves
 * its own collaborators is a service locator, which hides its dependencies
 * from its constructor signature and from anyone trying to test it.
 */
export function getContainer(): DependencyContainer {
  return container;
}
