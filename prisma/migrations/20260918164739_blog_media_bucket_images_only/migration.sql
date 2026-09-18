-- Narrows the `blog-media` bucket to what the application actually accepts.
--
-- The bucket was created for "images and PDF attachments" (25 MB, with
-- `application/pdf` allowed), but `MEDIA_TYPES` in `src/lib/constants/media.ts`
-- only ever listed four image types at 10 MB, so the bucket was the more
-- permissive of the two. That gap is the one the bucket exists to close: it is
-- the last check on a signed upload URL, so it has to refuse whatever
-- `checkMedia` refuses.
--
-- Existing objects are untouched; `allowed_mime_types` and `file_size_limit`
-- are checked on upload only.

UPDATE storage.buckets
SET
  file_size_limit = 10485760, -- 10 MB, the per-type cap in `MEDIA_TYPES`
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'blog-media';
