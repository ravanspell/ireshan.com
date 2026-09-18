import type { EditorConfig, ToolConstructable } from '@editorjs/editorjs';

import { IMAGE_CONTENT_TYPES } from '@lib/constants/media';

/** What the Editor.js image tool expects back from a custom uploader. */
type UploadResponse = { success: number; file: { url: string } };

type Uploader = {
  uploadByFile: (file: Blob) => Promise<UploadResponse>;
};

type EditorToolOptions = {
  /** Editor-only - the viewer just renders the URL already in the block. */
  imageUploader?: Uploader;
};

/**
 * The CMS block tools, shared by `BlogEditor` and `CMSViewer`.
 *
 * Both must register the same set. Editor.js only ships `paragraph` by
 * default and replaces any unregistered block type with a stub reading "The
 * block can not be displayed correctly" - a quiet degrade, not an error - so
 * a viewer with fewer tools than the editor stubs its own content.
 *
 * Every tool here supports `readOnly: true`, which Editor.js requires of all
 * of them: @see https://editorjs.io/configuration/
 *
 * Imported dynamically to keep ~135 KB of tools out of the initial bundle on
 * the public `/blog/[slug]` route, behind the same lazy load as Editor.js
 * itself. (Not for SSR safety - they guard their `document` access.)
 */
export async function loadEditorTools({
  imageUploader,
}: EditorToolOptions = {}): Promise<EditorConfig['tools']> {
  const [Header, Paragraph, CodeTool, List, ImageTool] = await Promise.all([
    import('@editorjs/header').then((m) => m.default),
    import('@editorjs/paragraph').then((m) => m.default),
    import('@editorjs/code').then((m) => m.default),
    import('@editorjs/list').then((m) => m.default),
    import('@editorjs/image').then((m) => m.default),
  ]);

  return {
    header: {
      class: Header as unknown as ToolConstructable,
      inlineToolbar: true,
    },
    paragraph: {
      class: Paragraph as unknown as ToolConstructable,
      inlineToolbar: true,
    },
    list: List as unknown as ToolConstructable,
    code: CodeTool as unknown as ToolConstructable,
    image: {
      class: ImageTool as unknown as ToolConstructable,
      config: {
        // Limits the file picker; `MediaService` is what actually enforces it.
        types: IMAGE_CONTENT_TYPES.join(','),
        ...(imageUploader ? { uploader: imageUploader } : {}),
      },
    }
  };
}
