import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { API, BlockAPI, BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

import AIAssistPanel from '@organisms/AIAssistPanel/AIAssistPanel';

/** lucide's `sparkles`, for the toolbox. */
const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>';

/** Paragraph blocks store HTML, so the model's plain text is escaped. */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Editor.js block tool for the writing assistant: a temporary block holding
 * `AIAssistPanel`, which is swapped for paragraph blocks on insert.
 *
 * `validate()` returns `false`, so Editor.js leaves the block out of `save()` -
 * it never reaches the database, which is why `CMSViewer` doesn't register it.
 */
export default class AIAssistTool implements BlockTool {
  private api: API;
  private block: BlockAPI;
  private root: Root | null = null;

  constructor({ api, block }: BlockToolConstructorOptions) {
    this.api = api;
    this.block = block;
  }

  static get toolbox() {
    return { title: 'AI assist', icon: ICON };
  }

  /** Enter inserts a newline in the panel's textareas instead of splitting the block. */
  static get enableLineBreaks(): boolean {
    return true;
  }

  render(): HTMLElement {
    const holder = document.createElement('div');

    // Editor.js handles keys on the block - Backspace in an empty textarea
    // would delete it, arrows would jump to the neighbouring block.
    for (const type of ['keydown', 'paste'] as const) {
      holder.addEventListener(type, (event) => event.stopPropagation());
    }

    this.root = createRoot(holder);
    this.root.render(
      createElement(AIAssistPanel, {
        onInsert: (text: string) => this.insert(text),
        onDiscard: () => this.api.blocks.delete(this.index()),
      }),
    );

    return holder;
  }

  save(): object {
    return {};
  }

  validate(): boolean {
    return false;
  }

  destroy(): void {
    // Deferred: `blocks.delete()` runs this from the panel's own click handler.
    const root = this.root;
    this.root = null;
    if (root) setTimeout(() => root.unmount());
  }

  private index(): number {
    return this.api.blocks.getBlockIndex(this.block.id);
  }

  /** Swaps this block for one paragraph block per paragraph of text. */
  private insert(text: string): void {
    const blocks = text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => ({ type: 'paragraph', data: { text: escapeHtml(paragraph) } }));

    const index = this.index();

    // Inserted after, then deleted: deleting first could empty the document,
    // and Editor.js refills an empty one with a stray paragraph.
    this.api.blocks.insertMany(blocks, index + 1);
    this.api.blocks.delete(index);
  }
}
