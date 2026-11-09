import { Injectable, inject } from '@lib/di/injectable';
import { Db } from '@lib/db';
import { Prisma } from '@generated/prisma/client';
import { BaseRepository } from './base.repository';

export interface RateLimitHit {
  /** Hits in the current window, including this one. */
  count: number;
  resetAt: Date;
}

/**
 * Fixed-window counters in `rate_limits`. Raw SQL so increment-or-reset is one
 * atomic statement, timed by the database clock.
 */
@Injectable()
export class RateLimitRepository extends BaseRepository {
  constructor(@inject(Db) private db: Db) {
    super();
  }

  /** Records a hit, starting a new window if the current one has expired. */
  async hit(key: string, windowSeconds: number): Promise<RateLimitHit> {
    const window = Prisma.sql`make_interval(secs => ${windowSeconds}::double precision)`;
    const expired = Prisma.sql`rate_limits.window_start <= now() - ${window}`;

    const [row] = await this.db.$queryRaw<{ count: number; reset_at: Date }[]>`
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (${key}, 1, now())
      ON CONFLICT (key) DO UPDATE SET
        count        = CASE WHEN ${expired} THEN 1     ELSE rate_limits.count + 1 END,
        window_start = CASE WHEN ${expired} THEN now() ELSE rate_limits.window_start END
      RETURNING count, window_start + ${window} AS reset_at
    `;

    return { count: Number(row.count), resetAt: new Date(row.reset_at) };
  }

  async reset(key: string): Promise<void> {
    await this.db.rateLimit.deleteMany({ where: { key } });
  }

  async pruneOlderThan(seconds: number): Promise<void> {
    await this.db.rateLimit.deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - seconds * 1000) } },
    });
  }
}
