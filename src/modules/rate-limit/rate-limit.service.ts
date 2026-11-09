import { createHash } from 'node:crypto';

import { BaseService, TooManyRequestsError } from '@lib/core/base.service';
import { RateLimitRepository } from './rate-limit.repository';
import { RATE_LIMIT_PRUNE_AFTER_SECONDS } from '@lib/constants/rate-limits';

/** Share of `consume()` calls that also delete stale rows. */
const PRUNE_PROBABILITY = 0.01;

export interface RateLimitRule {
  /** Namespace for this rule's counters, e.g. `login:ip`. */
  bucket: string;
  limit: number;
  windowSeconds: number;
}

/** Fixed-window limiter. Fails closed: if the counter is unreachable, the request is refused. */
export class RateLimitService extends BaseService {
  constructor(private rateLimits: RateLimitRepository) {
    super();
  }

  /**
   * Counts one hit for `subject` (an IP, email, user id...) under `rule`.
   * @throws TooManyRequestsError once the subject exceeds `rule.limit` in the window.
   */
  async consume(rule: RateLimitRule, subject: string): Promise<void> {
    let hit;
    try {
      hit = await this.rateLimits.hit(this.key(rule, subject), rule.windowSeconds);
    } catch (error) {
      this.logError('rate limit check failed', error);
      // Generic message so the driver error doesn't reach the client.
      throw new Error('Service temporarily unavailable. Please try again shortly.');
    }

    // Before the limit check, so refused (attack) traffic also pays for cleanup.
    if (Math.random() < PRUNE_PROBABILITY) await this.prune();

    if (hit.count > rule.limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((hit.resetAt.getTime() - Date.now()) / 1000));
      this.logWarn('rate limit exceeded', {
        bucket: rule.bucket,
        count: hit.count,
        retryAfterSeconds,
      });
      throw new TooManyRequestsError(
        'Too many attempts. Please try again later.',
        retryAfterSeconds,
      );
    }
  }

  /** Clears `subject`'s counter under `rule`. Best-effort: failures are only logged. */
  async reset(rule: RateLimitRule, subject: string): Promise<void> {
    try {
      await this.rateLimits.reset(this.key(rule, subject));
    } catch (error) {
      this.logError('rate limit reset failed', error);
    }
  }

  /** Subjects are hashed so the table holds no readable IPs or emails. */
  private key(rule: RateLimitRule, subject: string): string {
    return `${rule.bucket}:${createHash('sha256').update(subject).digest('hex')}`;
  }

  /** Deletes stale rows. Best-effort: failures are only logged. */
  private async prune(): Promise<void> {
    try {
      await this.rateLimits.pruneOlderThan(RATE_LIMIT_PRUNE_AFTER_SECONDS);
    } catch (error) {
      this.logError('rate limit prune failed', error);
    }
  }
}
