import 'server-only';

import { headers } from 'next/headers';

/**
 * Client IP from `x-real-ip` / `x-forwarded-for`. Trusted because Vercel
 * overwrites both; behind another proxy they may be spoofable.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get('x-real-ip')?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() || // left-most = original client
    'unknown'
  );
}
