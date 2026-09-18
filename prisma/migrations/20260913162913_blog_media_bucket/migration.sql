-- Supabase Storage bucket for post images and PDF attachments.
--
-- The `storage` schema is outside Prisma's control, so this never appears in
-- `migrate diff`; it lives here so a fresh project gets the bucket from
-- `migrate deploy` rather than dashboard clicks.
--
-- Size cap and MIME list duplicate `src/lib/constants/media.ts` - the bucket
-- enforces them on the upload itself, so a signed URL can't store what
-- `MediaService` would have refused. Change both together.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-media',
  'blog-media',
  true, -- public read: Editor.js stores a plain URL in the block
  26214400, -- 25 MB, the largest per-type cap (PDFs)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- `createSignedUploadUrl` checks that the *calling* user could insert the
-- object, so a signed-in user needs INSERT - plus SELECT, because Storage
-- writes the row with `INSERT ... RETURNING`, which Postgres checks against
-- SELECT policies too. No UPDATE or DELETE: object keys are random and never
-- overwritten. Anonymous reads need no policy - public bucket URLs bypass RLS.
CREATE POLICY "blog_media_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "blog_media_select_authenticated"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'blog-media');
