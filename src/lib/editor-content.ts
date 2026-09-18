import type { EditorContent } from '@dtos/post.dto';

/** Editor.js wraps inline formatting in HTML and escapes entities. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Derives a plain-text preview from an Editor.js document.
 *
 * Computed once on save and stored on the row so the blog index can render
 * cards without loading every post's full block document.
 *
 * @param maxLength - Hard cap; must stay within the `excerpt` column width.
 */
export function deriveExcerpt(content: EditorContent, maxLength = 300): string | null {
  const text = content.blocks
    .filter((block) => block.type === 'paragraph' || block.type === 'header')
    .map((block) => (typeof block.data.text === 'string' ? toPlainText(block.data.text) : ''))
    .filter(Boolean)
    .join(' ');

  if (!text) return null;
  if (text.length <= maxLength) return text;

  // Cut at a word boundary so the preview doesn't end mid-word.
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > maxLength / 2 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}
