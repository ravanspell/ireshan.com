import type { Tag as TagRow } from '@generated/prisma/client';

/**
 * Tag Domain Model
 * Represents a tag entity for categorizing blog posts.
 *
 * Plain data rather than a class - see the note on `Post`.
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

/**
 * Map a tag row to the model.
 */
export function toTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt,
  };
}
