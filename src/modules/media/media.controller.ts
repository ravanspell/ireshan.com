import { BaseController, type ControllerResult } from '@lib/core/base.controller';
import { MediaService, type SignedUpload } from './media.service';
import { createUploadUrlSchema } from './media.dto';

/**
 * Media Controller
 * Handles Server Actions for post media uploads
 */
export class MediaController extends BaseController {
  constructor(private mediaService: MediaService) {
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
      return this.handleError(error, 'Failed to prepare upload');
    }
  }
}
