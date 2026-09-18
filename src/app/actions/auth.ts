'use server';

import { redirect } from 'next/navigation';
import { resolve } from '@/lib/di/container';
import { AuthController } from '@controllers/auth.controller';
import { LoginFormData } from '@dtos/auth.dto';
import { ROUTES } from '@/lib/constants/routes';
import { resolveNextPath } from '@/lib/auth/redirect';

/**
 * Server Action: Login
 *
 * Authenticates a user with email and password.
 *
 * @param next - Path to land on after a successful login
 * @param credentials - Object containing email and password
 * @returns Object with errors if validation/authentication fails, otherwise redirects
 */
export async function loginAction(next: string, credentials: LoginFormData) {
  const authController = resolve(AuthController);

  const result = await authController.login(credentials);

  if (!result.success) {
    return {
      error: 'error' in result ? result.error : undefined,
      errors: 'errors' in result ? result.errors : undefined,
    };
  }

  // Outside the failure branch on purpose: `redirect()` signals by throwing,
  // so it must not run inside a try/catch that would swallow it.
  redirect(resolveNextPath(next));
}

/**
 * Server Action: Logout
 *
 * Signs out the current user and redirects to the login page.
 */
export async function logoutAction() {
  // Get AuthController from DI container
  const authController = resolve(AuthController);

  // Execute logout via controller
  const result = await authController.logout();

  // Return error if logout failed
  if (!result.success) {
    return {
      error: result.error,
    };
  }

  // Redirect to login page on successful logout
  redirect(ROUTES.LOGIN);
}
