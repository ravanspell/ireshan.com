import 'reflect-metadata';
import { inject, injectable, Lifecycle } from 'tsyringe';

/**
 * Lifetime of a provider, in the style of Nest's `Scope`.
 *
 * These map onto tsyringe's `Lifecycle`, but are named for what they mean here
 * so call sites don't have to know the mapping.
 */
export const Scope = {
  /**
   * A new instance every `resolve()`. The default, and the right answer for
   * anything that might ever touch request state.
   */
  Transient: Lifecycle.Transient,

  /**
   * One instance for the whole process, shared by every concurrent request.
   * Only for classes that hold nothing but their injected dependencies -
   * storing a user, a `cookies()`-bound client or a request id on `this` in a
   * singleton leaks it across requests.
   */
  Singleton: Lifecycle.Singleton,

  /**
   * One instance per `resolve()` call - i.e. shared within a single object
   * graph, fresh for the next one. Use when two collaborators in the same
   * graph must see the same instance without it outliving the request.
   */
  Resolution: Lifecycle.ResolutionScoped,

  /**
   * One instance per container. Equivalent to Nest's `Scope.REQUEST`, but only
   * if something creates a child container per request
   * (`getContainer().createChildContainer()`); resolved from the root
   * container it behaves like a singleton. Nothing wires that up today.
   */
  Container: Lifecycle.ContainerScoped,
} as const;

export type Scope = (typeof Scope)[keyof typeof Scope];

export interface InjectableOptions {
  /** Defaults to {@link Scope.Transient}. */
  scope?: Scope;
}

const SCOPE_METADATA = Symbol.for('di:scope');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

/**
 * Marks a class as resolvable and declares how long its instances live.
 *
 * Wraps tsyringe's `injectable()` and records the scope as metadata; the
 * composition root in `registry.ts` reads it back and registers the class
 * accordingly. Declaring the lifetime on the class keeps it next to the code
 * that has to honour it - a class annotated `Singleton` is making a promise
 * about its own fields.
 *
 * @example
 * @Injectable()                              // transient (default)
 * @Injectable({ scope: Scope.Singleton })    // one per process
 */
export function Injectable<T>(options: InjectableOptions = {}) {
  return (target: Constructor<T>): void => {
    Reflect.defineMetadata(SCOPE_METADATA, options.scope ?? Scope.Transient, target);
    injectable<T>()(target);
  };
}

/**
 * Reads the scope declared by `@Injectable()`, or `undefined` when the class
 * wasn't decorated with it (e.g. it still uses tsyringe's bare `injectable()`).
 */
export function getScope(target: Constructor<unknown>): Scope | undefined {
  return Reflect.getOwnMetadata(SCOPE_METADATA, target) as Scope | undefined;
}

/** Re-exported so providers import every DI decorator from one place. */
export { inject };
