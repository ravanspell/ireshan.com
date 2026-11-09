/**
 * Sign-in limits. Per IP stops one machine; per email stops many machines
 * targeting one account (at the cost of letting someone lock the admin out).
 */
export const LOGIN_RATE_LIMITS = {
  perIp: { bucket: 'login:ip', limit: 5, windowSeconds: 15 * 60 },
  perEmail: { bucket: 'login:email', limit: 10, windowSeconds: 60 * 60 },
} as const;

/** Rows older than this are pruned. Must exceed the longest window above. */
export const RATE_LIMIT_PRUNE_AFTER_SECONDS = 24 * 60 * 60;
