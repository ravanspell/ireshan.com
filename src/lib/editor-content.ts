import type { EditorContent } from '@dtos/post.dto';
import { slugify } from '@lib/slug';

export interface Heading {
  /** Anchor id, unique within the document. */
  id: string;
  text: string;
  /** The header block's level, 1-6. */
  level: number;
}

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
 * Every `header` block in document order, with a unique anchor id. Empty ones
 * are kept: `CMSViewer` pairs these ids with the rendered headers by position,
 * so skipping one would shift the rest.
 */
export function extractHeadings(content: EditorContent): Heading[] {
  const used = new Set<string>();

  return content.blocks
    .filter((block) => block.type === 'header')
    .map((block) => {
      const text = typeof block.data.text === 'string' ? toPlainText(block.data.text) : '';
      const level = typeof block.data.level === 'number' ? block.data.level : 2;

      // Repeated headings ("Example", "Example") get `example`, `example-2`.
      const base = slugify(text) || 'section';
      let id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);

      return { id, text, level };
    });
}

export interface TocEntry {
  id: string;
  text: string;
  /** 0 for the post's top heading level, 1 for the level below it. */
  depth: number;
}

/**
 * Named headings within the top two levels the post uses (h2/h3, h3/h4, ...).
 * Empty when fewer than two - one heading isn't worth a table of contents.
 */
export function toTocEntries(headings: Heading[]): TocEntry[] {
  const named = headings.filter((h) => h.text);
  if (named.length < 2) return [];

  const top = Math.min(...named.map((h) => h.level));
  const entries = named
    .filter((h) => h.level <= top + 1)
    .map(({ id, text, level }) => ({ id, text, depth: level - top }));

  return entries.length < 2 ? [] : entries;
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
