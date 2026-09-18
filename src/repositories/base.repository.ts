// Imported by every repository through this base class, which guarantees the
// decorator-metadata polyfill is installed before any `@injectable()` class
// is defined, whatever the entry point.
import "reflect-metadata";

/**
 * Base Repository class
 * All repository classes should extend this base class
 */
export abstract class BaseRepository {
  constructor() {}
}
