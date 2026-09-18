import { randomUUID } from "crypto";
import { Injectable, inject } from "@lib/di/injectable";
import { BaseService } from "./base.service";
import { AuthService } from "./auth.service";
import { createClient } from "@/utils/supabase/server";
import { CreateUploadUrlDto } from "@dtos/media.dto";
import { MEDIA_BUCKET, MEDIA_TYPES, formatBytes, isMediaContentType } from "@lib/constants/media";

/** What the browser needs to upload straight to Supabase Storage. */
export interface SignedUpload {
  path: string;
  token: string;
  publicUrl: string;
}

/**
 * Media Service
 * Issues signed upload URLs for post images and attachments.
 *
 * No repository: like `AuthService`, it talks to Supabase (Storage) directly
 * rather than to Prisma.
 *
 * Uploads go browser → Storage with a one-time token instead of through a
 * Server Action, because action bodies are capped at 1 MB by default (and
 * Vercel functions at ~4.5 MB) - too small for a PDF.
 */
@Injectable()
export class MediaService extends BaseService {
  constructor(@inject(AuthService) private authService: AuthService) {
    super();
  }

  async createSignedUpload(data: CreateUploadUrlDto): Promise<SignedUpload> {
    // Server Actions are public endpoints - see `PostService.requireAuthorId`.
    const user = await this.authService.getCurrentUser();
    if (!user) this.unauthorized();

    if (!isMediaContentType(data.contentType)) {
      this.badRequest(`Unsupported file type: ${data.contentType}`);
    }

    const { ext, maxBytes } = MEDIA_TYPES[data.contentType];
    if (data.size > maxBytes) {
      this.badRequest(`File is too large (max ${formatBytes(maxBytes)})`);
    }

    // The server names the object, never the client: a random key can't
    // collide with or overwrite an existing file, and the extension comes from
    // the validated type rather than a user-supplied filename.
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const path = `posts/${now.getUTCFullYear()}/${month}/${randomUUID()}.${ext}`;

    const supabase = await createClient();
    const bucket = supabase.storage.from(MEDIA_BUCKET);

    const { data: signed, error } = await bucket.createSignedUploadUrl(path);
    if (error || !signed) {
      this.logError("createSignedUploadUrl failed", error);
      throw new Error("Could not prepare the upload");
    }

    return {
      path: signed.path,
      token: signed.token,
      publicUrl: bucket.getPublicUrl(signed.path).data.publicUrl,
    };
  }
}
