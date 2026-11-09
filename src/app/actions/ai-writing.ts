'use server';

import { aiWritingController } from '@lib/composition';
import type { GenerateParagraphDto } from '@modules/ai-writing/ai-writing.dto';

/**
 * Server Action: Generate Paragraph
 *
 * Called by the editor's AI assist block. `AiWritingService` enforces
 * authentication.
 */
export async function generateParagraphAction(input: GenerateParagraphDto) {
  return aiWritingController.generateParagraph(input);
}
