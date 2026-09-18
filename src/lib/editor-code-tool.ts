import CodeTool from '@editorjs/code';
import type { BlockToolConstructorOptions, SanitizerConfig } from '@editorjs/editorjs';

import { CODE_LANGUAGES, CODE_LANGUAGE_LABELS } from '@lib/constants/code-languages';

/** What the block saves. `language` is absent on blocks saved before it existed. */
export type CodeData = {
  code: string;
  /** A highlight.js language id, or `''` for auto-detect. */
  language?: string;
};

/**
 * `@editorjs/code` with syntax highlighting and a language picker.
 *
 * The base tool renders a `<textarea>`, which holds text and nothing else - a
 * highlighter colours by wrapping tokens in `<span>`s, so no amount of CSS can
 * reach it. It also saves `{ code }` alone, leaving a highlighter nothing to
 * key off. This subclass fixes both without replacing the tool, because every
 * third-party highlighting tool for Editor.js is unmaintained (the newest was
 * last published in Jan 2024).
 *
 * Both modes paint the same highlighted `<code>`, reached two different ways:
 * - **Editing** keeps the textarea as the real input and lays it, transparent,
 *   over the painted copy. See `attachHighlightLayer`.
 * - **Read-only** (`CMSViewer`) drops the textarea for a plain `<pre><code>`.
 *
 * The block type stays `code` and `language` is optional, so existing posts
 * load unchanged.
 */
export default class CodeWithLanguage extends CodeTool {
  // `api` and `readOnly` are private fields on the base class, and TypeScript
  // rejects a subclass field that shadows one - hence the prefix on these two.
  private toolApi: BlockToolConstructorOptions<CodeData>['api'];
  private toolReadOnly: boolean;

  private language: string;
  private codeEl: HTMLElement | null = null;
  private preEl: HTMLElement | null = null;
  private textareaEl: HTMLTextAreaElement | null = null;
  private frame = 0;

  constructor(options: BlockToolConstructorOptions<CodeData>) {
    // The base reads only `data.code`; `language` rides along untouched and is
    // re-attached by `save()`.
    super(options as ConstructorParameters<typeof CodeTool>[0]);

    this.toolApi = options.api;
    this.toolReadOnly = options.readOnly;
    this.language = options.data?.language ?? '';
  }

  /**
   * `language: false` means "strip all tags", which is what a language id
   * wants. Editor.js would keep the key regardless - it falls back to the same
   * default for keys it doesn't recognise - so this is about being explicit.
   */
  static get sanitize(): SanitizerConfig {
    return { code: true, language: false };
  }

  render(): HTMLDivElement {
    const holder = super.render();

    if (this.toolReadOnly) return this.drawPreview();

    const textarea = holder.querySelector('textarea');
    if (textarea) this.attachHighlightLayer(textarea);

    holder.appendChild(this.drawLanguageSelect());
    return holder;
  }

  destroy(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  /**
   * Does not call `super.save()`, whose unguarded `querySelector('textarea')`
   * would throw on the read-only view. That view can still reach here: the
   * per-block `block.data` getter behind merge and conversion runs `save()`
   * even when a top-level save is refused.
   */
  save(codeWrapper: HTMLDivElement): CodeData {
    const textarea = codeWrapper.querySelector('textarea');

    return {
      code: textarea ? textarea.value : (this.data.code ?? ''),
      language: this.language,
    };
  }

  /** Editor only - the dropdown that gives the block its language. */
  private drawLanguageSelect(): HTMLElement {
    const select = document.createElement('select');
    select.classList.add('ce-code__lang');
    select.setAttribute('aria-label', this.toolApi.i18n.t('Code language'));

    for (const { value, label } of CODE_LANGUAGES) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    }

    // An id we don't offer (hand-edited JSON) would otherwise show as
    // "Auto-detect" while the block went on saving the original value.
    select.value = CODE_LANGUAGE_LABELS.has(this.language) ? this.language : '';

    select.addEventListener('change', () => {
      this.language = select.value;
      this.schedulePaint();
    });
    // Editor.js binds block shortcuts on keydown; without this, typing in the
    // select triggers them.
    select.addEventListener('keydown', (event) => event.stopPropagation());

    return select;
  }

  /** Read-only only - the `<pre><code>` a reader sees. */
  private drawPreview(): HTMLDivElement {
    const holder = document.createElement('div');
    holder.classList.add(this.toolApi.styles.block, 'ce-code', 'ce-code--read');

    const pre = document.createElement('pre');
    pre.classList.add('ce-code__preview');

    const code = document.createElement('code');
    // `textContent`, not `innerHTML`: stored code is author input, kept with
    // its tags intact by the `code: true` sanitizer rule. The only HTML ever
    // assigned is highlight.js output, which escapes what it wraps.
    code.textContent = this.data.code ?? '';

    pre.appendChild(code);
    holder.appendChild(pre);

    this.codeEl = code;
    this.preEl = pre;
    this.schedulePaint();

    return holder;
  }

  /**
   * Editor only - paints the highlighted copy *behind* the textarea, which
   * `_editorjs.css` then renders transparent apart from its caret.
   *
   * The textarea stays the real input, so caret, selection, undo, IME and the
   * base tool's Tab-indent handler all keep working; a contenteditable surface
   * would have to reimplement every one. The cost is that both layers must
   * agree exactly on font metrics and padding.
   */
  private attachHighlightLayer(textarea: HTMLTextAreaElement): void {
    const layer = document.createElement('div');
    layer.classList.add('ce-code__editor');

    const pre = document.createElement('pre');
    pre.classList.add('ce-code__highlight');
    // It duplicates the textarea's text; announcing both reads as doubled.
    pre.setAttribute('aria-hidden', 'true');

    const code = document.createElement('code');
    pre.appendChild(code);

    textarea.replaceWith(layer);
    layer.append(pre, textarea);

    this.textareaEl = textarea;
    this.codeEl = code;
    this.preEl = pre;

    textarea.addEventListener('input', () => this.schedulePaint());
    // Long lines don't wrap, so the textarea scrolls - the layer has to follow.
    textarea.addEventListener('scroll', () => {
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    });

    this.schedulePaint();
  }

  /**
   * One repaint per frame. Highlighting is O(source) and runs on every
   * keystroke, so without this a held-down key queues a full pass per event.
   */
  private schedulePaint(): void {
    if (this.frame) return;

    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      void this.paint();
    });
  }

  /**
   * highlight.js is imported here rather than at module scope so it is fetched
   * only once a code block exists on the page, and never on a post without
   * one. Until it resolves the code is already readable as plain monospace.
   */
  private async paint(): Promise<void> {
    const code = this.codeEl;
    if (!code) return;

    const source = this.textareaEl?.value ?? this.data.code ?? '';
    if (!source.trim()) {
      code.textContent = '';
      return;
    }

    const { default: hljs } = await import('highlight.js/lib/common');

    // `highlight()` throws on an id it doesn't know, so one missing from this
    // bundle degrades to detection rather than blanking the block.
    const result =
      this.language && hljs.getLanguage(this.language)
        ? hljs.highlight(source, { language: this.language, ignoreIllegals: true })
        : hljs.highlightAuto(source);

    // `<pre>` swallows one trailing newline, which would leave the editor's
    // layer a line short whenever the author ends on a blank line.
    code.innerHTML = source.endsWith('\n') ? `${result.value}\n` : result.value;

    const detected = this.language || result.language;
    code.className = 'hljs';
    if (detected && detected !== 'plaintext') {
      code.classList.add(`language-${detected}`);
    }

    this.paintBadge();
  }

  /**
   * The badge only ever shows the author's own choice. `highlightAuto` guesses,
   * and guesses badly on short snippets - it reads `SELECT id FROM users;` as
   * Bash. Colouring a bad guess is a cosmetic miss; labelling one is a claim.
   */
  private paintBadge(): void {
    const pre = this.preEl;
    if (!pre) return;

    if (this.language && this.language !== 'plaintext') {
      pre.dataset.language = CODE_LANGUAGE_LABELS.get(this.language) ?? this.language;
    } else {
      delete pre.dataset.language;
    }
  }
}
