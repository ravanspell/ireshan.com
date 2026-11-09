import { BaseController, type ControllerResult } from '@lib/core/base.controller';
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

  async generateParagraph(input: unknown): Promise<ControllerResult<string>> {
    try {
      const validated = generateParagraphSchema.parse(input);

      const text = await this.aiWritingService.generateParagraph(validated);

      return {
        success: true as const,
        data: text,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to generate text');
    }
  }
}
