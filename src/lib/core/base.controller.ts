// Imported by every controller through this base class, which guarantees the
// decorator-metadata polyfill is installed before any `@injectable()` class
// is defined, whatever the entry point.
import 'reflect-metadata';

import { ZodError } from 'zod';

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
 */
export abstract class BaseController {
  constructor() {}

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
