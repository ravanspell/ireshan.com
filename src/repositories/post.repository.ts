import { Injectable, inject } from '@lib/di/injectable';
import { Db } from '@lib/db';
import { BaseRepository } from './base.repository';
import { toPost } from '@models/post.model';
import { CreatePostDto, UpdatePostDto } from '@dtos/post.dto';

/**
 * Post Repository
 * Handles data access for Post entities
 */

/**
 * Posts arrive here with their tags already resolved to ids - the join table
 * stores ids, and turning the editor's tag names into rows is the service's
 * job (`PostService.resolveTagIds`), not a second write buried in here.
 */
type CreatePostData = Omit<CreatePostDto, 'tagNames'> & {
  authorId: string;
  excerpt: string | null;
  publishedAt: Date | null;
  tagIds: string[];
};

type UpdatePostData = Partial<Omit<UpdatePostDto, 'id' | 'tagNames'>> & {
  excerpt?: string | null;
  publishedAt?: Date | null;
  /** Undefined leaves the post's tags untouched; an array replaces them. */
  tagIds?: string[];
};

@Injectable()
export class PostRepository extends BaseRepository {
  constructor(@inject(Db) private db: Db) {
    super();
  }

  /**
   * Create a new post
   */
  async create(data: CreatePostData) {
    const { tagIds, ...postData } = data;

    const post = await this.db.post.create({
      data: {
        ...postData,
        content: this.asJson(postData.content),
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return toPost(post);
  }

  /**
   * Find post by ID
   */
  async findById(id: string) {
    const post = await this.db.post.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return post ? toPost(post) : null;
  }

  /**
   * Find post by slug.
   *
   * `publishedOnly` is what the public blog route passes - filtering in the
   * query rather than after the fetch means a draft never leaves the database.
   */
  async findBySlug(slug: string, options?: { publishedOnly?: boolean }) {
    const post = await this.db.post.findFirst({
      where: {
        slug,
        ...(options?.publishedOnly ? { published: true } : {}),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return post ? toPost(post) : null;
  }

  /**
   * Get all posts.
   *
   * The blog index passes `includeContent: false` and renders from `excerpt`,
   * so listing N posts doesn't pull N full block documents out of Postgres.
   */
  async findAll(options?: {
    includeContent?: boolean;
    /** `true` published only, `false` drafts only; undefined lists both. */
    published?: boolean;
    /** Defaults to `publishedAt`, else `updatedAt` - a draft's `publishedAt` is null. */
    sortBy?: 'publishedAt' | 'createdAt' | 'updatedAt';
    direction?: 'asc' | 'desc';
  }) {
    const direction = options?.direction ?? 'desc';
    const sortBy = options?.sortBy ?? (options?.published === true ? 'publishedAt' : 'updatedAt');

    const posts = await this.db.post.findMany({
      where: options?.published === undefined ? undefined : { published: options.published },
      select: {
        id: true,
        title: true,
        slug: true,
        content: options?.includeContent ?? true,
        excerpt: true,
        published: true,
        publishedAt: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { [sortBy]: direction },
    });

    return posts.map(toPost);
  }

  /**
   * Update a post
   */
  async update(id: string, data: UpdatePostData) {
    // `content` is pulled out of the spread so the Prisma-shaped value below is
    // the only one in the object type, not a union with the validated one.
    const { tagIds, content, ...updateData } = data;

    // Handle tag updates if provided
    const tagUpdate = tagIds
      ? {
          deleteMany: {}, // Remove all existing tags
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        }
      : undefined;

    const post = await this.db.post.update({
      where: { id },
      data: {
        ...updateData,
        ...(content ? { content: this.asJson(content) } : {}),
        ...(tagUpdate && { tags: tagUpdate }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return toPost(post);
  }

  /**
   * Delete a post
   */
  async delete(id: string) {
    await this.db.post.delete({
      where: { id },
    });
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string) {
    const post = await this.db.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) return false;
    if (excludeId && post.id === excludeId) return false;

    return true;
  }
}
