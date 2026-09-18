/**
 * Prisma client wired for Next.js: a decorated `Db` class the DI container can
 * inject, plus the process-wide instance `registry.ts` actually registers.
 *
 * `reflect-metadata` is imported first because `Db` is decorated and this module
 * is imported by repositories that may load before the container bootstraps -
 * the polyfill has to be installed before the class body runs.
 */
import "reflect-metadata";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@generated/prisma/client";
import { Injectable, Scope } from "@lib/di/injectable";

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
      "DATABASE_URL is not set. Prisma 7 takes the runtime connection from the " +
        "driver adapter in src/lib/db.ts, not from prisma/schema.prisma.",
    );
  }
  return url;
}

/**
 * Prisma client bound to the pooled connection, injectable as a DI token.
 *
 * The singleton scope is declarative only - the container never constructs this
 * class. `registry.ts` registers the {@link db} instance below, which is cached
 * on `globalThis` so one connection pool is shared by every module graph.
 */
@Injectable({ scope: Scope.Singleton })
export class Db extends PrismaClient {
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: connectionString() }),
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
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
 * The process-wide {@link Db} instance - what `registry.ts` registers and every
 * repository ends up using.
 *
 * Outside production it is stashed on `globalThis` so hot reload reuses the same
 * client instead of opening a new connection pool on each recompile.
 */
export const db = globalForPrisma.prisma ?? new Db();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
