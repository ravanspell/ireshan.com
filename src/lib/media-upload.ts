import { createUploadUrlAction } from '@/app/actions/media';
import { createClient } from '@lib/supabase/client';
import { MEDIA_BUCKET, checkMedia } from '@lib/constants/media';

/** Longest edge a blog image is stored at - wider than the post column at 2x. */
const MAX_IMAGE_EDGE = 1600;
const WEBP_QUALITY = 0.82;

/** Formats a canvas can re-encode losslessly enough to be worth replacing. */
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Re-encodes a raster image as WebP, capped at `MAX_IMAGE_EDGE`.
 *
 * Storage and egress are the free-tier limits that matter, and a phone photo
 * is often 3-5 MB for something displayed ~800px wide. Returns the original
 * whenever re-encoding wouldn't make it smaller or can't be trusted, and never
 * touches GIFs (it would drop the animation).
 */
async function compressImage(file: Blob): Promise<Blob> {
  if (!COMPRESSIBLE_TYPES.includes(file.type)) return file;

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

  const context = canvas.getContext('2d');
  context?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // No 2D context (memory pressure, or a canvas past the browser's area limit)
  // leaves the canvas blank, and a blank WebP compresses small enough to pass
  // the size check below - so it would silently replace the image.
  if (!context) return file;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
  );

  // Safari without WebP encoding hands back PNG; only keep a real, smaller WebP.
  if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;

  return blob;
}

/**
 * Uploads one file to the public media bucket and returns its public URL.
 *
 * The server only signs the upload (checking the session, type and size) and
 * names the object; the bytes go straight from the browser to Supabase
 * Storage. Throws an `Error` with a user-facing message on any failure.
 */
export async function uploadMedia(file: Blob): Promise<string> {
  const body = await compressImage(file);

  // Mirrors the server check so a bad file fails before any round-trip. The
  // filename is never sent - the server derives the object key and extension.
  const check = checkMedia(body.type, body.size);
  if (!check.ok) throw new Error(check.error);

  const signed = await createUploadUrlAction({ contentType: body.type, size: body.size });
  if (!signed.success) {
    throw new Error(
      signed.error || Object.values(signed.errors ?? {}).join(', ') || 'Upload failed',
    );
  }

  const { error } = await createClient()
    .storage.from(MEDIA_BUCKET)
    .uploadToSignedUrl(signed.data.path, signed.data.token, body, { contentType: body.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return signed.data.publicUrl;
}
