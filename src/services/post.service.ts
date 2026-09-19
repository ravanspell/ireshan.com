import { Injectable, inject } from '@lib/di/injectable';
import { BaseService } from './base.service';
import { AuthService } from './auth.service';
import { PostRepository } from '@repositories/post.repository';
import { TagRepository } from '@repositories/tag.repository';
import { UserRepository } from '@repositories/user.repository';
import { CreatePostDto, UpdatePostDto, UpsertPostDto } from '@dtos/post.dto';
import { deriveExcerpt } from '@lib/editor-content';

/**
 * Post Service
 * Contains business logic for post operations
 */
@Injectable()
export class PostService extends BaseService {
  constructor(
    @inject(PostRepository) private postRepository: PostRepository,
    @inject(TagRepository) private tagRepository: TagRepository,
    @inject(AuthService) private authService: AuthService,
    @inject(UserRepository) private userRepository: UserRepository,
  ) {
    super();
  }

  /**
   * Every write below, and every read that can see drafts, goes through this.
   *
   * Server Actions are public HTTP endpoints: the request posts to whatever
   * route the caller is on, so `middleware.ts` - which authorises by pathname -
   * is not a boundary for them. An action invoked from a public page reaches
   * this service with no session. Authorisation therefore lives here, next to
   * the data, and the author id comes from the session rather than from an
   * argument a caller could set.
   */
  private async requireAuthorId(): Promise<string> {
    const user = await this.authService.getCurrentUser();
    if (!user) this.unauthorized();
    return user.id;
  }

  /**
   * `publishedAt` is stamped the first time a post goes live and kept
   * thereafter, so unpublishing and republishing doesn't rewrite its date.
   */
  private publishedAtFor(published: boolean, existing: Date | null): Date | null {
    if (!published) return existing;
    return existing ?? new Date();
  }

  /**
   * The editor sends tag names; the join table stores ids. Names that don't
   * match an existing tag are created here, so an author never has to register
   * a tag before using it.
   */
  private async resolveTagIds(names: string[]): Promise<string[]> {
    if (names.length === 0) return [];

    const tags = await this.tagRepository.findOrCreateManyByName(names);

    return tags.map((tag) => tag.id);
  }

  // ---------- Public reads ----------

  /**
   * Published posts, newest first. Used by the public blog index, which
   * renders from `excerpt` and so doesn't need the block documents.
   */
  async getPublishedPosts() {
    return this.postRepository.findAll({ published: true, includeContent: false });
  }

  /**
   * A single published post. Drafts are filtered out in the query, so an
   * unpublished slug is a 404 to the public rather than a leak.
   */
  async getPublishedPostBySlug(slug: string) {
    const post = await this.postRepository.findBySlug(slug, { publishedOnly: true });

    if (!post) {
      this.notFound('Post');
    }

    // A second query rather than a join: `auth.users` isn't in the Prisma
    // schema, so the post query can't include it.
    return { ...post, author: await this.userRepository.findById(post.authorId) };
  }

  // ---------- Authenticated reads (drafts included) ----------

  /**
   * Every post including drafts - the admin list. Requires a session, because
   * unpublished content is not public.
   */
  async getAllPosts(options?: { includeContent?: boolean }) {
    await this.requireAuthorId();

    return this.postRepository.findAll({
      includeContent: options?.includeContent ?? false,
    });
  }

  /**
   * Unpublished posts, last edited first - the admin drafts list. Requires a
   * session; the cards render from `excerpt`, the editor loads content by id.
   */
  async getDraftPosts() {
    await this.requireAuthorId();

    return this.postRepository.findAll({ published: false, includeContent: false });
  }

  /** A post by slug, drafts included. Requires a session. */
  async getPostBySlug(slug: string) {
    await this.requireAuthorId();

    const post = await this.postRepository.findBySlug(slug);

    if (!post) {
      this.notFound('Post');
    }

    return post;
  }

  /** A post by id, drafts included. Requires a session. */
  async getPostById(id: string) {
    await this.requireAuthorId();

    const post = await this.postRepository.findById(id);

    if (!post) {
      this.notFound('Post');
    }

    return post;
  }

  // ---------- Writes ----------

  /**
   * Create a new post
   * Validates slug uniqueness before creating
   */
  async createPost(data: CreatePostDto) {
    const authorId = await this.requireAuthorId();

    if (await this.postRepository.slugExists(data.slug)) {
      this.conflict('A post with this slug already exists');
    }

    const { tagNames, ...fields } = data;

    return this.postRepository.create({
      ...fields,
      authorId,
      excerpt: deriveExcerpt(data.content),
      publishedAt: this.publishedAtFor(data.published, null),
      tagIds: await this.resolveTagIds(tagNames),
    });
  }

  /**
   * Update an existing post
   * Validates slug uniqueness if slug is being updated
   */
  async updatePost(id: string, data: Partial<UpdatePostDto>) {
    await this.requireAuthorId();

    const existing = await this.postRepository.findById(id);
    if (!existing) {
      this.notFound('Post', id);
    }

    if (data.slug && (await this.postRepository.slugExists(data.slug, id))) {
      this.conflict('A post with this slug already exists');
    }

    const published = data.published ?? existing.published;

    // Listed field by field rather than spread: `UpdatePostDto` carries the
    // post's own `id`, and spreading it would hand Prisma a no-op write of the
    // primary key.
    return this.postRepository.update(id, {
      title: data.title,
      slug: data.slug,
      content: data.content,
      published: data.published,
      // Only recompute the preview when the content actually changed.
      excerpt: data.content ? deriveExcerpt(data.content) : undefined,
      publishedAt: this.publishedAtFor(published, existing.publishedAt),
      // Undefined leaves the existing tags alone; `[]` clears them.
      tagIds: data.tagNames === undefined ? undefined : await this.resolveTagIds(data.tagNames),
    });
  }

  /**
   * Upsert a post (create or update)
   * What the editor calls: create on first save, update on every save after.
   */
  async upsertPost(data: UpsertPostDto) {
    if (data.id) {
      const { id, ...rest } = data;
      return this.updatePost(id, rest);
    }

    return this.createPost(data);
  }

  /**
   * Delete a post
   */
  async deletePost(id: string) {
    await this.requireAuthorId();

    return this.postRepository.delete(id);
  }
}
