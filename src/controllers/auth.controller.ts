import { Injectable, inject } from "@lib/di/injectable";
import { BaseController } from "./base.controller";
import { AuthService } from "@services/auth.service";
import { LoginFormData } from "@dtos/auth.dto";

/**
 * Auth Controller
 * Handles Server Actions for authentication
 */
@Injectable()
export class AuthController extends BaseController {
  constructor(@inject(AuthService) private authService: AuthService) {
    super();
  }

  /**
   * Login action
   * Validates credentials and authenticates user.
   * Validation now happens inside the service as well,
   * so ZodError can bubble up from either layer.
   */
  async login(credentials: LoginFormData) {
    try {
      await this.authService.signIn(credentials);
      return { success: true as const, data: undefined };
    } catch (error) {
      return this.handleError(error, "Authentication failed");
    }
  }

  /**
   * Logout action
   * Signs out the current user
   */
  async logout() {
    try {
      await this.authService.signOut();
      return { success: true as const, data: undefined };
    } catch (error) {
      return this.handleError(error, "Logout failed");
    }
  }

  /**
   * Get current user
   * Returns null (not an error) when no user is logged in.
   */
  async getCurrentUser() {
    try {
      const user = await this.authService.getCurrentUser();
      return { success: true as const, data: user };
    } catch (error) {
      return this.handleError(error, "Failed to get user");
    }
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated() {
    const isAuth = await this.authService.isAuthenticated();
    return { success: true as const, data: isAuth };
  }
}
