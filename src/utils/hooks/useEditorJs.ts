'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { OutputData } from '@editorjs/editorjs';
import { loadEditorTools } from '@lib/editor-tools';
import { uploadMedia } from '@lib/media-upload';
import { useIsMounted } from '@/utils/hooks/useMounted';

/** The element Editor.js mounts into. Rendered by whoever calls this hook. */
export const EDITOR_HOLDER_ID = 'editorjs';

/** Only the slice of the Editor.js instance this hook drives. */
interface EditorJSInstance {
  destroy: () => void;
  save: () => Promise<OutputData>;
  render: (data: OutputData) => Promise<void>;
}

interface UseEditorJsOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  /**
   * Called with the reason an image upload failed, or `null` when a fresh one
   * starts. The Editor.js image tool only shows a generic "upload failed"
   * toast, so the cause (wrong type, too large, signed out) has to surface
   * outside it.
   */
  onUploadError: (message: string | null) => void;
}

/**
 * Owns the Editor.js instance: the lazy import, the tool set, the image
 * uploader and the teardown.
 *
 * Kept out of the component tree because it is lifecycle, not markup - the
 * template that owns the save calls this and renders a plain holder div
 * through the organism.
 */
export function useEditorJs({ initialData, onUploadError }: UseEditorJsOptions) {
  const isMounted = useIsMounted();
  const editorRef = useRef<EditorJSInstance | null>(null);

  // Held in a ref so a caller passing an inline arrow doesn't re-run the
  // effect below and tear the editor down on every render.
  const onUploadErrorRef = useRef(onUploadError);
  onUploadErrorRef.current = onUploadError;

  const reportUploadErrors = useCallback(async <T,>(upload: Promise<T>): Promise<T> => {
    onUploadErrorRef.current(null);
    try {
      return await upload;
    } catch (error) {
      onUploadErrorRef.current(error instanceof Error ? error.message : 'Upload failed');
      throw error;
    }
  }, []);

  // Memoised on `initialData` alone: every other value it closes over is a
  // module import or a ref. Without this the function identity changed on
  // each render, so listing it as an effect dependency would tear down and
  // rebuild the editor continuously.
  const initiateEditorJs = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;

    const editor = new EditorJS({
      holder: EDITOR_HOLDER_ID,
      autofocus: true,
      placeholder: 'Start writing your story...',
      // Editor.js's default is 300px of click-to-append space below the last
      // block, which reads as a broken empty panel.
      minHeight: 80,
      data: initialData,
      // Shared with `CMSViewer` so a block type that saves here is always a
      // block type the public post page can render.
      tools: await loadEditorTools({
        imageUploader: {
          async uploadByFile(file: Blob) {
            const url = await reportUploadErrors(uploadMedia(file));
            return { success: 1, file: { url } };
          },
        },
      }),
      onReady: () => {
        editorRef.current = editor;
      },
    });
  }, [initialData, reportUploadErrors]);

  useEffect(() => {
    if (!isMounted) return;

    if (!editorRef.current) {
      initiateEditorJs();
    }

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [initiateEditorJs, isMounted]);

  /** The current document, or `undefined` before Editor.js has finished loading. */
  const save = useCallback(() => editorRef.current?.save(), []);

  return { save };
}
