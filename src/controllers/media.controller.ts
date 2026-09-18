import { Injectable, inject } from "@lib/di/injectable";
import { BaseController, type ControllerResult } from "./base.controller";
import { MediaService, type SignedUpload } from "@services/media.service";
import { createUploadUrlSchema } from "@dtos/media.dto";

/**
 * Media Controller
 * Handles Server Actions for post media uploads
 */
@Injectable()
export class MediaController extends BaseController {
  constructor(@inject(MediaService) private mediaService: MediaService) {
    super();
  }

  /**
   * Issue a one-time URL the browser uploads a single file to.
   * Nothing is revalidated: the file isn't referenced until the post is saved.
   */
  async createUploadUrl(input: unknown): Promise<ControllerResult<SignedUpload>> {
    try {
      const validated = createUploadUrlSchema.parse(input);

      const upload = await this.mediaService.createSignedUpload(validated);

      return { success: true as const, data: upload };
    } catch (error) {
      return this.handleError(error, "Failed to prepare upload");
    }
  }
}
