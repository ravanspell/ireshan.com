import { AsyncLocalStorage } from 'node:async_hooks';
import type { User } from '@supabase/supabase-js';
import { UnauthorizedError } from '@lib/errors';

/** The signed-in user on this request, or `null`. */
export type SessionCheck = () => Promise<User | null>;

let sessionCheck: SessionCheck | undefined;

/** The user an `@Authenticated()` call is running as, scoped to that call. */
const userContext = new AsyncLocalStorage<User>();

/** Called once by `registry.ts`, so services needn't inject `AuthService` for the gate. */
export function installSessionCheck(check: SessionCheck): void {
  sessionCheck = check;
}

/**
 * Throws `UnauthorizedError` unless someone is signed in, and exposes them to
 * the method through {@link currentUser}. Put it on every method that writes
 * or reads drafts: Server Actions bypass `middleware.ts`.
 *
 * Wraps the method itself rather than tagging it with metadata, so no call
 * path can skip it. Fails closed if no check is installed. Nested calls reuse
 * the outer call's user instead of asking Supabase again.
 *
 * @example
 * ```ts
 * @Authenticated()
 * async deletePost(id: string) { ... }
 * ```
 */
export function Authenticated() {
  return <A extends unknown[], R>(
    _target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: A) => Promise<R>>,
  ): void => {
    const method = descriptor.value;
    if (!method) {
      throw new Error(`[auth] @Authenticated() on ${String(key)} must decorate a method`);
    }

    descriptor.value = async function (this: unknown, ...args: A): Promise<R> {
      if (!sessionCheck) {
        throw new Error(
          `[auth] ${String(key)} ran before the session check was installed - ` +
            `resolve services through "@lib/di/container".`,
        );
      }
      // get the session information
      const user = userContext.getStore() ?? (await sessionCheck());
      if (!user) throw new UnauthorizedError();

      return userContext.run(user, () => method.apply(this, args));
    };
  };
}

/**
 * The signed-in user, inside an `@Authenticated()` method.
 *
 * @throws If called anywhere else - that's a missing decorator, not a signed-out user.
 */
export function currentUser(): User {
  const user = userContext.getStore();
  if (!user) {
    throw new Error('[auth] currentUser() called outside an @Authenticated() method');
  }
  return user;
}
