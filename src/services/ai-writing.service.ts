import { Injectable, inject } from '@lib/di/injectable';
import { Llm, type LlmMessage } from '@lib/ai/llm';
import { GenerateParagraphDto } from '@dtos/ai-writing.dto';
import { BaseService } from './base.service';
import { AuthService } from './auth.service';

const SYSTEM_PROMPT = `
You are a writing assistant for a personal technical blog.
The author gives you an idea and you write one or two paragraphs for it, in the first person, in a clear and direct voice.
When they ask for changes, return the complete revised text.
Reply with the paragraphs only - plain text, no headings, lists, markdown or commentary. S
eparate paragraphs with a blank line.`;

/**
 * AI Writing Service
 * Writes and refines paragraphs from the author's idea.
 *
 * No repository: like `MediaService`, it talks to an external API rather than
 * to Prisma.
 */
@Injectable()
export class AiWritingService extends BaseService {
  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(Llm) private llm: Llm,
  ) {
    super();
  }

  async generateParagraph({ idea, revisions }: GenerateParagraphDto): Promise<string> {
    // Server Actions are public endpoints - see `PostService.requireAuthorId`.
    // Here it also guards the API quota.
    const user = await this.authService.getCurrentUser();
    if (!user) this.unauthorized();

    // The idea, then each earlier draft followed by the feedback on it.
    return this.llm.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: idea },
      ...revisions.flatMap<LlmMessage>(({ text, feedback }) => [
        { role: 'assistant', content: text },
        { role: 'user', content: feedback },
      ]),
    ]);
  }
}
