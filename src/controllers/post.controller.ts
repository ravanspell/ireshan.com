import { Injectable, inject } from '@lib/di/injectable';
import { BaseController } from './base.controller';
import { PostService } from '@services/post.service';
import { createPostSchema, updatePostSchema, upsertPostSchema } from '@dtos/post.dto';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@lib/constants/routes';

/**
 * Post Controller
 * Handles Server Actions for post operations
 */
@Injectable()
export class PostController extends BaseController {
  constructor(@inject(PostService) private postService: PostService) {
    super();
  }

  /**
   * Create a new post
   * Server Action handler
   */
  async createPost(formData: FormData) {
    try {
      const data = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        content: formData.get('content') as string,
        tagNames: formData.getAll('tagNames') as string[],
      };

      // Validate with Zod
      const validated = createPostSchema.parse(data);

      // Create post
      const post = await this.postService.createPost(validated);

      // Revalidate cache
      revalidatePath(ROUTES.BLOG.INDEX);
      revalidatePath(ROUTES.BLOG.POST(post.slug));
      revalidatePath(ROUTES.ADMIN.DASHBOARD);

      return { success: true as const, data: post };
    } catch (error) {
      return this.handleError(error, 'Failed to create post');
    }
  }

  /**
   * Update an existing post
   * Server Action handler
   */
  async updatePost(formData: FormData) {
    try {
      const data = {
        id: formData.get('id') as string,
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        content: formData.get('content') as string,
        // Absent means "leave the tags as they are", so an empty field list
        // must stay undefined rather than becoming an empty array.
        tagNames: formData.has('tagNames') ? (formData.getAll('tagNames') as string[]) : undefined,
      };

      // Validate with Zod
      const validated = updatePostSchema.parse(data);

      // Update post
      const post = await this.postService.updatePost(validated.id, validated);

      // Revalidate cache
      revalidatePath(ROUTES.BLOG.INDEX);
      revalidatePath(ROUTES.BLOG.POST(post.slug));
      revalidatePath(ROUTES.ADMIN.DASHBOARD);

      return { success: true as const, data: post };
    } catch (error) {
      return this.handleError(error, 'Failed to update post');
    }
  }

  /**
   * Upsert a post (create or update)
   * Server Action handler - legacy support
   */
  async upsertPost(data: unknown) {
    try {
      // Validate with Zod
      const validated = upsertPostSchema.parse(data);

      // Upsert post
      const post = await this.postService.upsertPost(validated);

      // Revalidate cache
      revalidatePath(ROUTES.BLOG.INDEX);
      revalidatePath(ROUTES.BLOG.POST(post.slug));
      revalidatePath(ROUTES.ADMIN.DASHBOARD);

      return { success: true as const, data: post };
    } catch (error) {
      return this.handleError(error, 'Failed to save post');
    }
  }

  /**
   * Get a published post by slug - the public blog route.
   */
  async getPublishedPostBySlug(slug: string) {
    try {
      const post = await this.postService.getPublishedPostBySlug(slug);
      return { success: true as const, data: post };
    } catch (error) {
      return this.handleError(error, 'Post not found');
    }
  }

  /**
   * Get all published posts - the public blog index.
   */
  async getPublishedPosts() {
    try {
      const posts = await this.postService.getPublishedPosts();
      return { success: true as const, data: posts };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch posts');
    }
  }

  /**
   * Get a post by slug including drafts. Requires a session.
   */
  async getPostBySlug(slug: string) {
    try {
      const post = await this.postService.getPostBySlug(slug);
      return { success: true as const, data: post };
    } catch (error) {
      return this.handleError(error, 'Post not found');
    }
  }

  /**
   * Get a post by id including drafts - what the editor loads. Requires a session.
   */
  async getPostById(id: string) {
    try {
      const post = await this.postService.getPostById(id);
      return { success: true as const, data: post };
    } catch (error) {
      return this.handleError(error, 'Post not found');
    }
  }

  /**
   * Get all posts including drafts - the admin list. Requires a session.
   */
  async getAllPosts(options?: { includeContent?: boolean }) {
    try {
      const posts = await this.postService.getAllPosts(options);
      return { success: true as const, data: posts };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch posts');
    }
  }

  /**
   * Delete a post
   * Server Action handler
   */
  async deletePost(id: string) {
    try {
      await this.postService.deletePost(id);

      // Revalidate cache
      revalidatePath(ROUTES.BLOG.INDEX);
      revalidatePath(ROUTES.ADMIN.DASHBOARD);

      return { success: true as const, data: undefined };
    } catch (error) {
      return this.handleError(error, 'Failed to delete post');
    }
  }
}
