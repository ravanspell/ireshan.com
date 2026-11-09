import { revalidatePath } from 'next/cache';
import { ZodError, type z } from 'zod';

import { DomainError } from '@lib/errors';

/**
 * Standard shape returned by controller methods to Server Actions.
 */
export type ControllerResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error?: string;
      errors?: Record<string, string>;
      /**
       * Machine-readable reason, present when a service threw a `DomainError`
       * (`NOT_FOUND`, `CONFLICT`, `UNAUTHORIZED`, `BAD_REQUEST`). Lets a caller
       * tell a missing post from a duplicate slug without reading `error`.
       */
      code?: string;
    };

/**
 * Base Controller class
 * All controller classes should extend this base class
 * Controllers handle Server Actions and coordinate with services
 *
 * - `run()` wraps a call in the standard result shape.
 * - `runValidated()` parses input with a Zod schema first, then does the same.
 * - `revalidate()` clears cached pages after a write.
 */
export abstract class BaseController {
  constructor() {}

  /**
   * Runs `fn` and wraps its outcome in a {@link ControllerResult}.
   *
   * @example
   * ```ts
   * getDraftPosts() {
   *   return this.run('Failed to fetch drafts', () => this.postService.getDraftPosts());
   * }
   * ```
   */
  protected async run<T>(
    fallbackMessage: string,
    fn: () => Promise<T>,
  ): Promise<ControllerResult<T>> {
    try {
      return { success: true, data: await fn() };
    } catch (error) {
      return this.handleError(error, fallbackMessage);
    }
  }

  /**
   * Parses `input` with `schema`, then runs `fn` with the parsed value. A
   * validation failure comes back as field-level `errors`, like any other
   * `ZodError`.
   *
   * @example
   * ```ts
   * upsertPost(input: unknown) {
   *   return this.runValidated(upsertPostSchema, input, 'Failed to save post', (data) =>
   *     this.postService.upsertPost(data),
   *   );
   * }
   * ```
   */
  protected runValidated<S extends z.ZodType, T>(
    schema: S,
    input: unknown,
    fallbackMessage: string,
    fn: (data: z.output<S>) => Promise<T>,
  ): Promise<ControllerResult<T>> {
    return this.run(fallbackMessage, () => fn(schema.parse(input)));
  }

  /** Clears the cached render of each path, so the next request sees the write. */
  protected revalidate(...paths: string[]): void {
    for (const path of paths) revalidatePath(path);
  }

  /**
   * Converts a caught error into the standard failure shape.
   * A ZodError becomes field-level errors; any other Error falls back to its
   * message, and non-Error throws fall back to `fallbackMessage`.
   */
  protected handleError(error: unknown, fallbackMessage: string): ControllerResult<never> {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      return { success: false, errors };
    }

    if (error instanceof DomainError) {
      return { success: false, error: error.message, code: error.code };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : fallbackMessage,
    };
  }
}
