// Imported by every repository through this base class, which guarantees the
// decorator-metadata polyfill is installed before any `@injectable()` class
// is defined, whatever the entry point.
import 'reflect-metadata';

import type { Prisma } from '@generated/prisma/client';

/**
 * Base Repository class
 * All repository classes should extend this base class
 */
export abstract class BaseRepository {
  constructor() {}

  /**
   * Narrow a validated object to what Prisma accepts for a `Json` column.
   *
   * Prisma's `InputJsonValue` demands an index signature, which a precise
   * validated type doesn't have - even though the value is plain JSON. The cast
   * belongs at the Prisma boundary, so it lives here and nowhere else.
   */
  protected asJson<T extends object>(value: T): Prisma.InputJsonObject {
    return value as unknown as Prisma.InputJsonObject;
  }
}
