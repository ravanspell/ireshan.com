import { BaseController } from '@lib/core/base.controller';
import { AiWritingService } from './ai-writing.service';
import { generateParagraphSchema } from './ai-writing.dto';

/**
 * AI Writing Controller
 * Handles Server Actions for the editor's writing assistant
 */
export class AiWritingController extends BaseController {
  constructor(private aiWritingService: AiWritingService) {
    super();
  }

  /** Writes a paragraph for the editor from the author's prompt. */
  generateParagraph(input: unknown) {
    return this.runValidated(generateParagraphSchema, input, 'Failed to generate text', (data) =>
      this.aiWritingService.generateParagraph(data),
    );
  }
}
