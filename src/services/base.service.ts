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

  // ---------- Current-user accessors ----------

  // Deliberately absent. A service that needs the current user injects
  // `AuthService` and calls `getCurrentUser()` on it:
  //
  //   constructor(
  //     @inject(PostRepository) private postRepository: PostRepository,
  //     @inject(AuthService) private authService: AuthService,
  //   ) { super(); }
  //
  // The previous helpers here resolved `AuthService` out of the container at
  // call time, behind a dynamic import that existed only to break the import
  // cycle that created (AuthService extends BaseService). That is a service
  // locator: the dependency is invisible in the constructor and unmockable.

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
