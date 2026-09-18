import { z } from 'zod';

/**
 * Editor.js `OutputData`.
 *
 * The editor sends a block document, not a string - validating its shape here
 * is what lets `content` be a real `jsonb` column instead of an opaque blob.
 * Block `data` is left open on purpose: each Editor.js tool defines its own,
 * and pinning it would break the moment a tool is added.
 */
export const editorContentSchema = z.object({
  time: z.number().optional(),
  version: z.string().optional(),
  blocks: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.string().min(1),
        data: z.record(z.string(), z.unknown()),
      }),
    )
    .min(1, 'Content is required'),
});

export type EditorContent = z.infer<typeof editorContentSchema>;

const title = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters');

const slug = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(200, 'Slug must be less than 200 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only');

/**
 * Tags are addressed by name, not id: the editor is a free-text field, and a
 * name the author types may not exist yet. `PostService` resolves each name to
 * a tag row - creating the missing ones - before the join table is written.
 */
const tagNames = z
  .array(z.string().trim().min(1, 'A tag cannot be empty').max(50, 'Tag must be less than 50 characters'))
  .max(10, 'A post can have at most 10 tags');

/**
 * Create Post Schema
 * Validation for creating a new blog post
 */
export const createPostSchema = z.object({
  title,
  slug,
  content: editorContentSchema,
  published: z.boolean().optional().default(false),
  tagNames: tagNames.optional().default([]),
});

/**
 * Update Post Schema
 * Validation for updating an existing blog post
 */
export const updatePostSchema = z.object({
  id: z.uuid('Invalid post ID'),
  title: title.optional(),
  slug: slug.optional(),
  content: editorContentSchema.optional(),
  published: z.boolean().optional(),
  /** Omitted leaves the post's tags untouched; `[]` clears them. */
  tagNames: tagNames.optional(),
});

/**
 * Upsert Post Schema
 * Combines create and update - if id exists, update; otherwise create
 */
export const upsertPostSchema = z.object({
  id: z.uuid('Invalid post ID').optional(),
  title,
  slug,
  content: editorContentSchema,
  published: z.boolean().optional().default(false),
  tagNames: tagNames.optional().default([]),
});

/**
 * Type Definitions
 */
export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type UpsertPostDto = z.infer<typeof upsertPostSchema>;
