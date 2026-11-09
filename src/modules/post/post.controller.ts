import { BaseController } from '@lib/core/base.controller';
import { PostService } from './post.service';
import {
  createPostSchema,
  deleteDraftSchema,
  unpublishPostSchema,
  updatePostSchema,
  upsertPostSchema,
} from './post.dto';
import { ROUTES } from '@lib/constants/routes';

/**
 * Post Controller
 * Handles Server Actions for post operations
 */
export class PostController extends BaseController {
  constructor(private postService: PostService) {
    super();
  }

  /**
   * Pages that show a post: the blog index, the post itself (when its slug is
   * known) and the admin lists.
   */
  private revalidatePostPages(slug?: string) {
    this.revalidate(
      ROUTES.BLOG.INDEX,
      ...(slug ? [ROUTES.BLOG.POST(slug)] : []),
      ROUTES.ADMIN.DASHBOARD,
      ROUTES.ADMIN.DRAFTS,
    );
  }

  // ---------- Writes ----------

  /**
   * Create a new post
   * Server Action handler
   */
  createPost(formData: FormData) {
    const input = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      tagNames: formData.getAll('tagNames'),
    };

    return this.runValidated(createPostSchema, input, 'Failed to create post', async (data) => {
      const post = await this.postService.createPost(data);
      this.revalidatePostPages(post.slug);
      return post;
    });
  }

  /**
   * Update an existing post
   * Server Action handler
   */
  updatePost(formData: FormData) {
    const input = {
      id: formData.get('id'),
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      // Absent means "leave the tags as they are", so an empty field list
      // must stay undefined rather than becoming an empty array.
      tagNames: formData.has('tagNames') ? formData.getAll('tagNames') : undefined,
    };

    return this.runValidated(updatePostSchema, input, 'Failed to update post', async (data) => {
      const post = await this.postService.updatePost(data.id, data);
      this.revalidatePostPages(post.slug);
      return post;
    });
  }

  /**
   * Upsert a post (create or update) - what the editor's save calls.
   * Server Action handler
   */
  upsertPost(input: unknown) {
    return this.runValidated(upsertPostSchema, input, 'Failed to save post', async (data) => {
      const post = await this.postService.upsertPost(data);
      this.revalidatePostPages(post.slug);
      return post;
    });
  }

  /**
   * Move a published post back to draft
   * Server Action handler
   */
  unpublishPost(id: string) {
    return this.runValidated(
      unpublishPostSchema,
      { id },
      'Failed to unpublish post',
      async (data) => {
        const post = await this.postService.unpublishPost(data.id);
        // The index loses a card and the post's URL 404s.
        this.revalidatePostPages(post.slug);
        // No payload - the caller needs the outcome, not the block document.
      },
    );
  }

  /**
   * Permanently delete an unpublished post
   * Server Action handler
   */
  deleteDraft(id: string) {
    return this.runValidated(deleteDraftSchema, { id }, 'Failed to delete draft', async (data) => {
      await this.postService.deleteDraft(data.id);
      // Drafts aren't on the blog; only the admin lists change.
      this.revalidate(ROUTES.ADMIN.DASHBOARD, ROUTES.ADMIN.DRAFTS);
    });
  }

  /**
   * Delete a post
   * Server Action handler
   */
  deletePost(id: string) {
    return this.run('Failed to delete post', async () => {
      await this.postService.deletePost(id);
      this.revalidatePostPages();
    });
  }

  // ---------- Reads ----------

  /** Get a published post by slug - the public blog route. */
  getPublishedPostBySlug(slug: string) {
    return this.run('Post not found', () => this.postService.getPublishedPostBySlug(slug));
  }

  /** Get all published posts - the public blog index. */
  getPublishedPosts() {
    return this.run('Failed to fetch posts', () => this.postService.getPublishedPosts());
  }

  /** Get a post by slug including drafts. Requires a session. */
  getPostBySlug(slug: string) {
    return this.run('Post not found', () => this.postService.getPostBySlug(slug));
  }

  /** Get a post by id including drafts - what the editor loads. Requires a session. */
  getPostById(id: string) {
    return this.run('Post not found', () => this.postService.getPostById(id));
  }

  /** Get all posts including drafts - the admin list. Requires a session. */
  getAllPosts(options?: { includeContent?: boolean }) {
    return this.run('Failed to fetch posts', () => this.postService.getAllPosts(options));
  }

  /** Unpublished posts only - the admin drafts list. Requires a session. */
  getDraftPosts() {
    return this.run('Failed to fetch drafts', () => this.postService.getDraftPosts());
  }
}
