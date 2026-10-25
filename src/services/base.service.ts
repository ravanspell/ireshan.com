// Imported by every service through this base class, which guarantees the
// decorator-metadata polyfill is installed before any `@injectable()` class
// below it is defined, regardless of which module happened to be the entry point.
import 'reflect-metadata';

import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '@lib/errors';

// Re-exported so services can keep importing them from their base class.
export {
  DomainError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from '@lib/errors';

/**
 * Base Service class
 * All service classes should extend this base class
 * Services contain business logic and orchestrate operations between repositories
 */
export abstract class BaseService {
  constructor() {}

  // ---------- Domain error helpers ----------

  protected notFound(entity: string, identifier?: string | number): never {
    const suffix = identifier !== undefined ? `: ${identifier}` : '';
    throw new NotFoundError(`${entity} not found${suffix}`);
  }

  protected conflict(message: string): never {
    throw new ConflictError(message);
  }

  protected unauthorized(message?: string): never {
    throw new UnauthorizedError(message);
  }

  protected badRequest(message: string): never {
    throw new BadRequestError(message);
  }

  // ---------- Logging ----------

  private get logPrefix(): string {
    return `[${this.constructor.name}]`;
  }

  protected logInfo(message: string, meta?: Record<string, unknown>): void {
    if (meta) console.info(this.logPrefix, message, meta);
    else console.info(this.logPrefix, message);
  }

  protected logWarn(message: string, meta?: Record<string, unknown>): void {
    if (meta) console.warn(this.logPrefix, message, meta);
    else console.warn(this.logPrefix, message);
  }

  protected logError(message: string, error?: unknown): void {
    if (error !== undefined) console.error(this.logPrefix, message, error);
    else console.error(this.logPrefix, message);
  }
}
