// Prisma 7 config: replaces the `url`/`directUrl` properties that used to live in
// the datasource block of `prisma/schema.prisma`. This file configures the *CLI*
// only (migrate, db push, db pull, studio); the application's runtime connection
// is made by the driver adapter in `src/lib/db.ts`.
//
// Prisma 7 no longer loads `.env` itself, hence the explicit dotenv import.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Migrate and introspection need the direct/session-mode connection (5432): the
// transaction pooler doesn't support the advisory locks and prepared statements
// they rely on. Falls back to DATABASE_URL for environments defining only one URL.
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // Read via process.env rather than Prisma's `env()` helper, and omitted entirely
  // when unset: this module is evaluated by *every* CLI command, so a hard throw
  // here would break `prisma generate` - and with it `npm install`'s postinstall -
  // on a fresh clone that has no `.env` yet. Commands that genuinely need a
  // connection report the missing datasource themselves.
  ...(migrationUrl ? { datasource: { url: migrationUrl } } : {}),
});
