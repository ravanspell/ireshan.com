import type { Post as PostRow, Tag as TagRow } from '@generated/prisma/client';
import type { EditorContent } from '@dtos/post.dto';
import { toTag, type Tag } from './tag.model';
import type { User } from './user.model';

/**
 * Shape the repository actually selects: a post row, optionally with its join
 * rows included, and with `content` absent on list queries that skip it.
 */
export type PostRowWithTags = Omit<PostRow, 'content'> & {
  content?: PostRow['content'];
  tags?: { tag: TagRow }[];
};

/**
 * Post Domain Model
 * Represents a blog post entity.
 *
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  /**
   * Absent on list queries built with `includeContent: false` - the blog index
   * renders from `excerpt` instead. Guard before rendering.
   */
  content?: EditorContent;
  /** Plain-text preview derived from the content on save. */
  excerpt: string | null;
  published: boolean;
  publishedAt: Date | null;
  authorId: string;
  /**
   * The author's public profile, looked up from `auth.users` by `authorId`.
   * Absent unless the service attached it (only the public post page does);
   * null when the auth user no longer exists.
   */
  author?: User | null;
  createdAt: Date;
  updatedAt: Date;
  /** Flattened from the `PostTag` join rows. Empty when tags weren't included. */
  tags: Tag[];
}

/**
 * Map a post row - with its join rows, where they were included - to the model.
 */
export function toPost(row: PostRowWithTags): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    // Prisma types a `Json` column as `JsonValue`; the shape was validated by
    // `editorContentSchema` on the way in.
    content: row.content as EditorContent | undefined,
    excerpt: row.excerpt,
    published: row.published,
    publishedAt: row.publishedAt,
    authorId: row.authorId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    tags: row.tags?.map((pt) => toTag(pt.tag)) ?? [],
  };
}
