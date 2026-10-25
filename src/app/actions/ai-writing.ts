'use server';

import { resolve } from '@/lib/di/container';
import { AiWritingController } from '@controllers/ai-writing.controller';
import type { GenerateParagraphDto } from '@dtos/ai-writing.dto';

/**
 * Server Action: Generate Paragraph
 *
 * Called by the editor's AI assist block. `AiWritingService` enforces
 * authentication.
 */
export async function generateParagraphAction(input: GenerateParagraphDto) {
  const aiWritingController = resolve(AiWritingController);

  return aiWritingController.generateParagraph(input);
}
