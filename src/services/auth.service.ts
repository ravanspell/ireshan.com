import { Injectable } from "@lib/di/injectable";
import { BaseService } from "./base.service";
import { createClient } from "@/utils/supabase/server";
import { loginSchema, LoginFormData } from "@dtos/auth.dto";

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
    this.name = "AuthError";
  }
}

/**
 * Auth Service
 * Handles authentication business logic using Supabase Auth.
 *
 * A fresh Supabase server client is created per call since it reads
 * the current request's cookies() - it cannot be cached on the instance.
 */
@Injectable()
export class AuthService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Sign in with email and password.
   * Validates input defensively before forwarding to Supabase.
   */
  async signIn(credentials: LoginFormData): Promise<void> {
    const validated = loginSchema.parse(credentials);
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      throw new AuthError(error.message, error);
    }
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
      // "Auth session missing" is the common case - no logged-in user.
      // Log anything else so unexpected failures aren't silently treated as "logged out".
      if (error.message !== "Auth session missing!") {
        console.error("getCurrentUser error:", error.message);
      }
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
