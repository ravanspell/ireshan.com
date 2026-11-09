import { Injectable, inject } from '@lib/di/injectable';
import { BaseService } from '@lib/core/base.service';
import { UserRepository } from './user.repository';

/**
 * User Service
 * The user module's public entry point for other modules. Users live in
 * Supabase Auth, so this is read-only: profile lookups for display.
 */
@Injectable()
export class UserService extends BaseService {
  constructor(@inject(UserRepository) private userRepository: UserRepository) {
    super();
  }

  /**
   * A user's public profile (name, avatar), or null for an id with no auth
   * user. Public: it backs the author byline on published posts.
   */
  async getPublicProfile(id: string) {
    return this.userRepository.findById(id);
  }
}
