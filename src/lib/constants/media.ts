/**
 * Upload rules for post media, shared by the browser (to reject a file before
 * any round-trip) and `MediaService` (which is the enforcing check).
 *
 * The bucket itself repeats the size cap and MIME list - see the
 * `blog_media_bucket` migration - so a signed upload URL can't be used to store
 * something these rules would have refused. Change both together.
 */
export const MEDIA_BUCKET = 'blog-media';

const MB = 1024 * 1024;

/** MIME type → extension the stored object gets, and its size cap. */
export const MEDIA_TYPES = {
  'image/jpeg': { ext: 'jpg', maxBytes: 10 * MB },
  'image/png': { ext: 'png', maxBytes: 10 * MB },
  'image/webp': { ext: 'webp', maxBytes: 10 * MB },
  'image/gif': { ext: 'gif', maxBytes: 10 * MB },
} as const;

// SVG is left out on purpose: the bucket is public and serves files inline, so
// an SVG could carry script that runs on the storage origin.

export type MediaContentType = keyof typeof MEDIA_TYPES;

export const IMAGE_CONTENT_TYPES = Object.keys(MEDIA_TYPES).filter((type) =>
  type.startsWith('image/'),
) as MediaContentType[];

export function isMediaContentType(type: string): type is MediaContentType {
  return Object.hasOwn(MEDIA_TYPES, type);
}

export function formatBytes(bytes: number): string {
  return bytes >= MB ? `${Math.round(bytes / MB)} MB` : `${Math.round(bytes / 1024)} KB`;
}
