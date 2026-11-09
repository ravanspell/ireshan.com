/**
 * Prisma client wired for Next.js: the `Db` type repositories take in their
 * constructors, plus the process-wide instance `@lib/composition` passes them.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma/client';

/**
 * Resolves the runtime connection string.
 *
 * Prisma 7 connects through a driver adapter rather than a `url` in the schema,
 * so the connection string is read here. Runtime traffic goes through Supabase's
 * transaction pooler (`DATABASE_URL`, port 6543) - never `DIRECT_URL`, which is
 * reserved for Migrate.
 *
 * @throws If `DATABASE_URL` is unset. Failing loudly is deliberate: `pg` would
 * otherwise silently fall back to libpq defaults (localhost, `$USER`).
 */
function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Prisma 7 takes the runtime connection from the ' +
        'driver adapter in src/lib/db.ts, not from prisma/schema.prisma.',
    );
  }
  return url;
}

/**
 * Prisma client bound to the pooled connection - the type repositories depend
 * on. Construct it only through {@link db} below: a second instance would open
 * a second connection pool.
 */
export class Db extends PrismaClient {
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: connectionString() }),
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  /** Closes the underlying pool. */
  async disconnect() {
    await this.$disconnect();
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: Db | undefined;
};

/**
 * The process-wide {@link Db} instance
 *
 * Outside production it is stashed on `globalThis` so hot reload reuses the same
 * client instead of opening a new connection pool on each recompile.
 */
export const db = globalForPrisma.prisma ?? new Db();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
