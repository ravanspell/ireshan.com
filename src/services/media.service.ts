import { randomUUID } from 'crypto';
import { Injectable } from '@lib/di/injectable';
import { Authenticated } from '@lib/auth/authenticated';
import { BaseService } from './base.service';
import { createClient } from '@lib/supabase/server';
import type { CreateUploadUrlDto } from '@dtos/media.dto';
import { MEDIA_BUCKET, checkMedia } from '@lib/constants/media';

/** What the browser needs to upload straight to Supabase Storage. */
export interface SignedUpload {
  path: string;
  token: string;
  publicUrl: string;
}

/**
 * Media Service
 * Issues signed upload URLs for post images.
 *
 * No repository: like `AuthService`, it talks to Supabase (Storage) directly
 * rather than to Prisma.
 *
 * Uploads go browser → Storage with a one-time token instead of through a
 * Server Action, because action bodies are capped at 1 MB by default (and
 * Vercel functions at ~4.5 MB) - smaller than the image cap in `checkMedia`.
 */
@Injectable()
export class MediaService extends BaseService {
  @Authenticated()
  async createSignedUpload(data: CreateUploadUrlDto): Promise<SignedUpload> {
    // The enforcing copy of the rule the browser also ran before uploading.
    const check = checkMedia(data.contentType, data.size);
    if (!check.ok) this.badRequest(check.error);

    // The server names the object, never the client: a random key can't
    // collide with or overwrite an existing file, and the extension comes from
    // the validated type rather than a user-supplied filename.
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const path = `posts/${now.getUTCFullYear()}/${month}/${randomUUID()}.${check.ext}`;

    const supabase = await createClient();
    const bucket = supabase.storage.from(MEDIA_BUCKET);

    const { data: signed, error } = await bucket.createSignedUploadUrl(path);
    if (error || !signed) {
      this.logError('createSignedUploadUrl failed', error);
      throw new Error('Could not prepare the upload');
    }

    return {
      path: signed.path,
      token: signed.token,
      publicUrl: bucket.getPublicUrl(signed.path).data.publicUrl,
    };
  }
}
