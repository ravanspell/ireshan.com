import 'reflect-metadata';
import 'server-only';

import OpenAI from 'openai';

import { Injectable, Scope } from '@lib/di/injectable';

/**
 * Gemini's OpenAI-compatible endpoint. The OpenAI SDK talks to it unchanged -
 * only the base URL and the key differ.
 * @see https://ai.google.dev/gemini-api/docs/openai
 */
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

/** One turn of a conversation. Our own type, so callers don't depend on the SDK's. */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * The LLM client, as an infrastructure adapter beside `Db`.
 *
 * A singleton because it holds nothing per-request: the SDK client is just a
 * configured HTTP client. Built lazily on first use rather than in the
 * constructor, so a missing `GEMINI_API_KEY` fails the AI request that needs
 * it instead of every `resolve()` - the build bootstraps the container to
 * prerender `/blog`, which has nothing to do with AI.
 */
@Injectable({ scope: Scope.Singleton })
export class Llm {
  private client: OpenAI | null = null;

  /**
   * Sends a conversation and returns the reply text, trimmed.
   *
   * @throws If the model returns no text.
   */
  async complete(messages: LlmMessage[]): Promise<string> {
    const model = process.env.LLM_MODEL as string;
    if (!model) {
      throw new Error('LLM_MODEL is not set - the writing assistant is unavailable.');
    }
    const completion = await this.getClient().chat.completions.create({
      model,
      messages,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('The assistant returned nothing - try again.');

    return text;
  }

  private getClient(): OpenAI {
    if (this.client) return this.client;

    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      throw new Error('LLM_API_KEY is not set - the writing assistant is unavailable.');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: GEMINI_BASE_URL,
      timeout: 30_000,
      maxRetries: 1,
    });

    return this.client;
  }
}
