// Must precede every import below: `emitDecoratorMetadata` compiles decorated
// classes into `Reflect.metadata(...)` calls that run at class-definition time.
import 'reflect-metadata';
import 'server-only';

import { container, type DependencyContainer } from 'tsyringe';

import { getScope, type Constructor } from './injectable';

import { installSessionCheck } from '@lib/auth/authenticated';
import { Db, db } from '@lib/db';
import { Llm } from '@lib/ai/llm';

import { PostRepository } from '@modules/post/post.repository';
import { RateLimitRepository } from '@modules/rate-limit/rate-limit.repository';
import { TagRepository } from '@modules/tag/tag.repository';
import { UserRepository } from '@modules/user/user.repository';

import { AiWritingService } from '@modules/ai-writing/ai-writing.service';
import { AuthService } from '@modules/auth/auth.service';
import { MediaService } from '@modules/media/media.service';
import { PostService } from '@modules/post/post.service';
import { RateLimitService } from '@modules/rate-limit/rate-limit.service';
import { TagService } from '@modules/tag/tag.service';
import { UserService } from '@modules/user/user.service';

import { AiWritingController } from '@modules/ai-writing/ai-writing.controller';
import { AuthController } from '@modules/auth/auth.controller';
import { MediaController } from '@modules/media/media.controller';
import { PostController } from '@modules/post/post.controller';
import { TagController } from '@modules/tag/tag.controller';

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
  // Infrastructure (`Db` is registered by instance, below)
  Llm,
  // Repositories
  PostRepository,
  RateLimitRepository,
  TagRepository,
  UserRepository,
  // Services
  AiWritingService,
  AuthService,
  MediaService,
  PostService,
  RateLimitService,
  TagService,
  UserService,
  // Controllers
  AiWritingController,
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

  // Resolved per call: each check needs the current request's cookies.
  installSessionCheck(() => container.resolve(AuthService).getCurrentUser());

  // Latched only after registration succeeds, so a throw above cannot leave the
  // latch closed over a half-registered container.
  bootstrapped = true;

  return container;
}
