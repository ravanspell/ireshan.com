// `reflect-metadata` must be evaluated before any decorated class module is,
// because `emitDecoratorMetadata` compiles `@injectable()` classes into
// `Reflect.metadata(...)` calls that run at class-definition time. Keeping this
// as the very first import means the polyfill is installed before the imports
// below pull in any controller, service or repository.
import 'reflect-metadata';
// Fails the build if this module ever ends up in a Client Component graph.
import 'server-only';

import { container, type DependencyContainer } from 'tsyringe';

import { getScope } from './injectable';

import { Db, db } from '@lib/db';

import { PostRepository } from '@repositories/post.repository';
import { TagRepository } from '@repositories/tag.repository';
import { UserRepository } from '@repositories/user.repository';

import { AuthService } from '@services/auth.service';
import { MediaService } from '@services/media.service';
import { PostService } from '@services/post.service';
import { TagService } from '@services/tag.service';

import { AuthController } from '@controllers/auth.controller';
import { MediaController } from '@controllers/media.controller';
import { PostController } from '@controllers/post.controller';
import { TagController } from '@controllers/tag.controller';

/**
 * Composition root.
 *
 * Every injectable class in the app is registered here explicitly. Nothing is
 * left to tsyringe's auto-registration fallback, which silently constructs an
 * unregistered class on demand - for `Db` that fallback would mean a second
 * `PrismaClient` (and a second connection pool) instead of the shared one.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

/**
 * Every class the container can hand out.
 *
 * Listing them here rather than letting the decorator self-register keeps
 * registration independent of import order - a provider is registered because
 * the composition root was evaluated, not because something happened to import
 * the provider's module first.
 *
 * Lifetimes are NOT decided here: each class declares its own with
 * `@Injectable({ scope })`, and `bootstrapContainer()` reads it back. See
 * `injectable.ts` for what the scopes mean.
 */
const PROVIDERS: Constructor<unknown>[] = [
  // Repositories
  PostRepository,
  TagRepository,
  UserRepository,
  // Services
  AuthService,
  MediaService,
  PostService,
  TagService,
  // Controllers
  AuthController,
  MediaController,
  PostController,
  TagController,
];

let bootstrapped = false;

/**
 * Registers every dependency exactly once per module instance.
 *
 * Next.js can evaluate this module more than once (RSC, SSR and route-handler
 * graphs are separate, and dev HMR re-evaluates on edit), so this is written to
 * be idempotent. The `Db` instance it registers is itself process-global - see
 * `globalForPrisma` in `@lib/db` - so duplicate module instances still share
 * one `PrismaClient`.
 */
export function bootstrapContainer(): DependencyContainer {
  if (bootstrapped) return container;
  bootstrapped = true;

  container.registerInstance(Db, db);

  for (const token of PROVIDERS) {
    const scope = getScope(token);

    if (scope === undefined) {
      // Almost always a class that still uses tsyringe's bare `injectable()`,
      // which would silently register as transient and ignore any lifetime the
      // author thought they were declaring.
      throw new Error(
        `[di] ${token.name} is listed as a provider but is not decorated with @Injectable(). ` +
          `Import it from "@lib/di/injectable" instead of "tsyringe".`,
      );
    }

    // Next can end up with two copies of this module sharing one tsyringe
    // container; re-registering would stack a duplicate entry per token.
    if (container.isRegistered(token)) continue;

    container.register(token, { useClass: token }, { lifecycle: scope });
  }

  return container;
}
