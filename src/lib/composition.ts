import 'server-only';

/**
 * Composition root.
 *
 * - Builds every repository, service and controller with plain `new`.
 * - Each instance is shared across all requests (one per server process).
 * - Classes must not keep per-request state on `this`.
 * - Installs the session check used by `@Authenticated()`.
 * - Exports only controllers, for use in `app/`.
 */

import { installSessionCheck } from '@lib/auth/authenticated';
import { db } from '@lib/db';
import { Llm } from '@lib/ai/llm';

import { AiWritingController } from '@modules/ai-writing/ai-writing.controller';
import { AiWritingService } from '@modules/ai-writing/ai-writing.service';
import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { MediaController } from '@modules/media/media.controller';
import { MediaService } from '@modules/media/media.service';
import { PostController } from '@modules/post/post.controller';
import { PostRepository } from '@modules/post/post.repository';
import { PostService } from '@modules/post/post.service';
import { RateLimitRepository } from '@modules/rate-limit/rate-limit.repository';
import { RateLimitService } from '@modules/rate-limit/rate-limit.service';
import { TagController } from '@modules/tag/tag.controller';
import { TagRepository } from '@modules/tag/tag.repository';
import { TagService } from '@modules/tag/tag.service';
import { UserRepository } from '@modules/user/user.repository';
import { UserService } from '@modules/user/user.service';

// ---------- Infrastructure ----------

const llm = new Llm();

// ---------- Repositories (all share the process-wide pool in `db`) ----------

const postRepository = new PostRepository(db);
const rateLimitRepository = new RateLimitRepository(db);
const tagRepository = new TagRepository(db);
const userRepository = new UserRepository(db);

// ---------- Services ----------

const rateLimitService = new RateLimitService(rateLimitRepository);
const authService = new AuthService(rateLimitService);
const tagService = new TagService(tagRepository);
const userService = new UserService(userRepository);
const postService = new PostService(postRepository, tagService, userService);
const mediaService = new MediaService();
const aiWritingService = new AiWritingService(llm);

// `@Authenticated()` fails closed until this runs. It runs as soon as this
// module is evaluated, and services are only reachable through the controllers
// exported below, so no decorated method can be called before it.
installSessionCheck(() => authService.getCurrentUser());

// ---------- Controllers: the entry points `app/` imports ----------

export const aiWritingController = new AiWritingController(aiWritingService);
export const authController = new AuthController(authService);
export const mediaController = new MediaController(mediaService);
export const postController = new PostController(postService);
export const tagController = new TagController(tagService);
