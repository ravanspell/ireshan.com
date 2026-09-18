import 'reflect-metadata';
import { inject, injectable, Lifecycle } from 'tsyringe';

/**
 * Any class the container can be asked for.
 *
 * Declared once so the unavoidable `any` is disabled in a single place.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Lifetime of a provider, in the style of Nest's `Scope`.
 *
 * Only the two lifetimes this app uses are exposed. tsyringe's container scope
 * needs a child container per request, and nothing creates one - exposing it
 * would mean shipping a scope that silently behaves like a singleton.
 */
export const Scope = {
  /** A new instance per `resolve()`. The default. */
  Transient: Lifecycle.Transient,

  /**
   * One instance per process, shared across concurrent requests. Only for
   * classes holding nothing but their injected dependencies - a user, a
   * `cookies()`-bound client or a request id on `this` would leak between them.
   */
  Singleton: Lifecycle.Singleton,
} as const;

export type Scope = (typeof Scope)[keyof typeof Scope];

export interface InjectableOptions {
  /** Defaults to {@link Scope.Transient}. */
  scope?: Scope;
}

const SCOPE_METADATA = Symbol.for('di:scope');

/**
 * Marks a class as resolvable and declares how long its instances live.
 *
 * Records the scope as metadata for {@link getScope}; `registry.ts` reads it
 * back at bootstrap. Declaring the lifetime on the class keeps it beside the
 * code that has to honour it.
 *
 * @example
 * ```ts
 * @Injectable()                           // transient (default)
 * @Injectable({ scope: Scope.Singleton }) // one per process
 * ```
 */
export function Injectable<T>(options: InjectableOptions = {}) {
  return (target: Constructor<T>): void => {
    Reflect.defineMetadata(SCOPE_METADATA, options.scope ?? Scope.Transient, target);
    injectable<T>()(target);
  };
}

/**
 * Reads the scope declared by `@Injectable()`.
 *
 * Uses `getOwnMetadata` so a subclass must declare its own lifetime rather than
 * inherit one.
 *
 * @returns The declared scope, or `undefined` if the class was never decorated.
 */
export function getScope(target: Constructor<unknown>): Scope | undefined {
  return Reflect.getOwnMetadata(SCOPE_METADATA, target) as Scope | undefined;
}

/** Re-exported so providers import every DI symbol from one place. */
export { inject };
