import { BaseController } from '@lib/core/base.controller';
import { AuthService } from './auth.service';
import { LoginFormData } from './auth.dto';

/**
 * Auth Controller
 * Handles Server Actions for authentication
 */
export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Login action
   * The service validates the credentials itself, so a `ZodError` from it
   * still comes back as field-level `errors`.
   */
  login(credentials: LoginFormData) {
    return this.run('Authentication failed', () => this.authService.signIn(credentials));
  }

  /** Logout action - signs out the current user. */
  logout() {
    return this.run('Logout failed', () => this.authService.signOut());
  }

  /** Get current user. Returns null (not an error) when no user is logged in. */
  getCurrentUser() {
    return this.run('Failed to get user', () => this.authService.getCurrentUser());
  }
}
