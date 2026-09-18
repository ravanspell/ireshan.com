/**
 * Upload rules for post media, shared by the browser (to reject a file before
 * any round-trip) and `MediaService` (which is the enforcing check).
 *
 * The bucket itself repeats the size cap and MIME list - see the
 * `blog_media_bucket*` migrations - so a signed upload URL can't be used to
 * store something these rules would have refused. Change both together.
 */
export const MEDIA_BUCKET = 'blog-media';

const MB = 1024 * 1024;

/** MIME type -> extension the stored object gets, and its size cap. */
const MEDIA_TYPES = {
  'image/jpeg': { ext: 'jpg', maxBytes: 10 * MB },
  'image/png': { ext: 'png', maxBytes: 10 * MB },
  'image/webp': { ext: 'webp', maxBytes: 10 * MB },
  'image/gif': { ext: 'gif', maxBytes: 10 * MB },
} as const;

// SVG is left out on purpose: the bucket is public and serves files inline, so
// an SVG could carry script that runs on the storage origin.

export type MediaContentType = keyof typeof MEDIA_TYPES;

/** Narrows the file picker in the Editor.js image tool. */
export const IMAGE_CONTENT_TYPES = Object.keys(MEDIA_TYPES).filter((type) =>
  type.startsWith('image/'),
) as MediaContentType[];

export type MediaCheck =
  | { ok: true; ext: string }
  | { ok: false; error: string };

function formatBytes(bytes: number): string {
  return bytes >= MB ? `${Math.round(bytes / MB)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * The single type/size rule, applied on both sides of the upload.
 *
 * Running the same function in the browser and in `MediaService` means the
 * message shown for a file the server would reject is the message the server
 * would have sent - and only the server's verdict can be trusted, since the
 * browser copy exists purely to skip a doomed round-trip.
 *
 * On success it returns the extension the stored object gets: the server names
 * every object, so the extension has to come from the validated type rather
 * than from a user-supplied filename.
 */
export function checkMedia(contentType: string, size: number): MediaCheck {
  if (!Object.hasOwn(MEDIA_TYPES, contentType)) {
    return { ok: false, error: `Unsupported file type${contentType ? `: ${contentType}` : ''}` };
  }

  const { ext, maxBytes } = MEDIA_TYPES[contentType as MediaContentType];
  if (size > maxBytes) {
    return { ok: false, error: `File is too large (max ${formatBytes(maxBytes)})` };
  }

  return { ok: true, ext };
}
