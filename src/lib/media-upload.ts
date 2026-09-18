import { createUploadUrlAction } from '@/app/actions/media';
import { createClient } from '@/utils/supabase/client';
import {
  MEDIA_BUCKET,
  MEDIA_TYPES,
  formatBytes,
  isMediaContentType
} from '@lib/constants/media';

/** Longest edge a blog image is stored at - wider than the post column at 2x. */
const MAX_IMAGE_EDGE = 1600;
const WEBP_QUALITY = 0.82;

export interface UploadedMedia {
  url: string;
  /** Bytes actually stored, which for an image may be less than the original. */
  size: number;
  contentType: string;
}

/**
 * Re-encodes a raster image as WebP, capped at `MAX_IMAGE_EDGE`.
 *
 * Storage and egress are the free-tier limits that matter, and a phone photo
 * is often 3–5 MB for something displayed ~800px wide. Returns the original
 * when re-encoding wouldn't make it smaller, and never touches GIFs (it would
 * drop the animation).
 */
async function compressImage(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file; // Undecodable here - let the upload proceed and fail or succeed as is.
  }

  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
  );

  // Safari without WebP encoding hands back PNG; only keep a real, smaller WebP.
  if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
}

/**
 * Uploads one file to the public media bucket and returns its URL.
 *
 * The server only signs the upload (checking the session, type and size); the
 * bytes go straight from the browser to Supabase Storage. Throws an `Error`
 * with a user-facing message on any failure.
 */
export async function uploadMedia(input: Blob): Promise<UploadedMedia> {
  const original = input instanceof File ? input : new File([input], 'upload', { type: input.type });
  const file = await compressImage(original);

  // Mirrors the server check so an oversized file fails before any round-trip.
  if (!isMediaContentType(file.type)) {
    throw new Error(`Unsupported file type${file.type ? `: ${file.type}` : ''}`);
  }
  const { maxBytes } = MEDIA_TYPES[file.type];
  if (file.size > maxBytes) {
    throw new Error(`File is too large (max ${formatBytes(maxBytes)})`);
  }

  const signed = await createUploadUrlAction({ contentType: file.type, size: file.size });
  if (!signed.success) {
    throw new Error(
      signed.error || Object.values(signed.errors ?? {}).join(', ') || 'Upload failed',
    );
  }

  const { error } = await createClient()
    .storage.from(MEDIA_BUCKET)
    .uploadToSignedUrl(signed.data.path, signed.data.token, file, { contentType: file.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return { url: signed.data.publicUrl, size: file.size, contentType: file.type };
}
