import { z } from 'zod';

/**
 * Create Upload URL Schema
 *
 * Describes the file the browser is about to upload - the bytes themselves
 * never pass through the server. Type and size are checked against
 * `MEDIA_TYPES` in `MediaService`, not here, so the rule has one home.
 */
export const createUploadUrlSchema = z.object({
  contentType: z.string().min(1, 'File type is required'),
  size: z.number().int().positive('File is empty'),
});

/**
 * Type Definitions
 */
export type CreateUploadUrlDto = z.infer<typeof createUploadUrlSchema>;
