import { BaseController } from '@lib/core/base.controller';
import { MediaService } from './media.service';
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
  createUploadUrl(input: unknown) {
    return this.runValidated(createUploadUrlSchema, input, 'Failed to prepare upload', (data) =>
      this.mediaService.createSignedUpload(data),
    );
  }
}
