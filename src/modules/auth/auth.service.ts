import { BaseService } from '@lib/core/base.service';
import { RateLimitService } from '@modules/rate-limit/rate-limit.service';
import { createClient } from '@lib/supabase/server';
import { loginSchema, LoginFormData } from './auth.dto';
import { isSignedOutError } from '@lib/auth/session-errors';
import { isSessionPastMaxAge } from '@lib/supabase/session-policy';
import { getClientIp } from '@lib/request/client-ip';
import { LOGIN_RATE_LIMITS } from '@lib/constants/rate-limits';

/**
 * Custom error class for authentication failures.
 * Preserves the original error context for easier debugging.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Auth Service
 * Handles authentication business logic using Supabase Auth.
 *
 * A fresh Supabase server client is created per call since it reads
 * the current request's cookies() - it cannot be cached on the instance.
 */
export class AuthService extends BaseService {
  constructor(private rateLimit: RateLimitService) {
    super();
  }

  /**
   * Sign in with email and password.
   * Validates input defensively before forwarding to Supabase.
   *
   * @throws TooManyRequestsError when either limit is exceeded.
   */
  async signIn(credentials: LoginFormData): Promise<void> {
    const validated = loginSchema.parse(credentials);

    // Rate-limited per IP and per email before Supabase is called. (Supabase's
    // own limits see only our server's IP.)
    const ip = await getClientIp();
    const email = validated.email.trim().toLowerCase();
    await this.rateLimit.consume(LOGIN_RATE_LIMITS.perIp, ip);
    await this.rateLimit.consume(LOGIN_RATE_LIMITS.perEmail, email);

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      throw new AuthError(error.message, error);
    }

    // Success clears the counters, so earlier typos don't count toward a lockout.
    await Promise.all([
      this.rateLimit.reset(LOGIN_RATE_LIMITS.perIp, ip),
      this.rateLimit.reset(LOGIN_RATE_LIMITS.perEmail, email),
    ]);
  }

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AuthError(error.message, error);
    }
  }

  /**
   * Get the current authenticated user.
   * Returns `null` when no session exists instead of throwing.
   */
  async getCurrentUser() {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // No session, or one Supabase just declared dead - both mean "nobody is
      // signed in", which is an answer, not a failure. Log anything else so
      // unexpected failures aren't silently treated as "logged out".
      if (!isSignedOutError(error)) {
        this.logError('getCurrentUser failed', error);
      }
      return null;
    }

    // Middleware enforces this on pages, but a Server Action posted from a
    // public route never passes through it - and this is what every write
    // authorises against.
    const { data } = await supabase.auth.getClaims();
    if (data && isSessionPastMaxAge(data.claims)) {
      await supabase.auth.signOut({ scope: 'local' });
      return null;
    }

    return user;
  }

  /**
   * Check if a user is currently authenticated.
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}
