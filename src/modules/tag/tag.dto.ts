import { z } from 'zod';

/**
 * Create Tag Schema
 * Validation for creating a new tag
 */
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
});

/**
 * Update Tag Schema
 * Validation for updating an existing tag
 */
export const updateTagSchema = z.object({
  id: z.uuid('Invalid tag ID'),
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters')
    .optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
    .optional(),
});

/**
 * Type Definitions
 */
export type CreateTagDto = z.infer<typeof createTagSchema>;
export type UpdateTagDto = z.infer<typeof updateTagSchema>;
