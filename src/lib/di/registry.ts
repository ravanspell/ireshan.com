// Must precede every import below: `emitDecoratorMetadata` compiles decorated
// classes into `Reflect.metadata(...)` calls that run at class-definition time.
import 'reflect-metadata';
import 'server-only';

import { container, type DependencyContainer } from 'tsyringe';

import { getScope, type Constructor } from './injectable';

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
 * Every class the container can hand out.
 *
 * Listing providers explicitly keeps registration independent of import order,
 * and keeps tsyringe's auto-registration fallback out of play - that fallback
 * constructs unregistered classes on demand, which for a repository would mean
 * building it with its own fresh `Db`, i.e. a second connection pool.
 *
 * Lifetimes are not set here: each class declares its own via `@Injectable`.
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
 * Composition root: registers `Db` and every provider, once.
 *
 * Next evaluates this module more than once (RSC, SSR and route-handler graphs
 * are separate, and HMR re-evaluates on edit), so idempotency is enforced twice
 * over: the `bootstrapped` latch short-circuits repeat calls into this module
 * instance, and the per-token `isRegistered` check covers what the latch cannot
 * see - two module copies, each with its own latch, sharing one container.
 *
 * @returns The bootstrapped tsyringe container.
 * @throws If a listed provider is missing its `@Injectable()` decorator.
 */
export function bootstrapContainer(): DependencyContainer {
  if (bootstrapped) return container;

  // Registered by instance, never by class: the container must hand out the
  // process-wide client from `@lib/db` rather than construct its own.
  if (!container.isRegistered(Db)) {
    container.registerInstance(Db, db);
  }

  for (const token of PROVIDERS) {
    const scope = getScope(token);

    if (scope === undefined) {
      // Usually a class still importing tsyringe's bare `injectable()`, which
      // registers as transient and ignores the lifetime its author declared.
      throw new Error(
        `[di] ${token.name} is listed as a provider but is not decorated with @Injectable(). ` +
        `Import it from "@lib/di/injectable" instead of "tsyringe".`,
      );
    }

    if (container.isRegistered(token)) continue;

    container.register(token, { useClass: token }, { lifecycle: scope });
  }

  // Latched only after registration succeeds, so a throw above cannot leave the
  // latch closed over a half-registered container.
  bootstrapped = true;

  return container;
}
