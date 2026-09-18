import { Injectable, inject } from '@lib/di/injectable';
import { Db } from '@lib/db';
import { BaseRepository } from './base.repository';
import { toUser, type UserRow } from '@models/user.model';

/**
 * User Repository
 * Reads Supabase Auth's `auth.users` table, which is where users live - there
 * is no user table in our own schema.
 *
 * Raw SQL rather than a Prisma model on purpose: declaring the `auth` schema in
 * `schema.prisma` would put Supabase-owned tables under Migrate, and every
 * `migrate diff` against the live database would propose dropping the ones we
 * don't model. Read-only - Supabase Auth remains the only writer.
 */
@Injectable()
export class UserRepository extends BaseRepository {
  constructor(@inject(Db) private db: Db) {
    super();
  }

  /**
   * A user's public profile, or null for an id with no auth user (e.g. a
   * deleted account). Selects only the metadata keys a reader may see.
   */
  async findById(id: string) {
    const rows = await this.db.$queryRaw<UserRow[]>`
      SELECT
        id::text                                AS id,
        raw_user_meta_data ->> 'full_name'      AS name,
        raw_user_meta_data ->> 'avatar_url'     AS avatar_url
      FROM auth.users
      WHERE id = ${id}::uuid
    `;

    return rows[0] ? toUser(rows[0]) : null;
  }
}
