'use client';

import { useEffect, useRef } from 'react';
import { loadEditorTools } from '@lib/editor-tools';

interface CMSViewerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

/**
 * `@editorjs/code` renders into a fixed `min-height: 200px` textarea with no
 * resize logic of its own - in the editor the author drags it taller by hand.
 * A reader can't, so anything longer sits clipped behind an inner scrollbar.
 */
function growCodeBlocks(holder: HTMLElement) {
  holder.querySelectorAll('textarea.ce-code__textarea').forEach((node) => {
    const textarea = node as HTMLTextAreaElement;
    textarea.style.height = `${textarea.scrollHeight}px`;
  });
}

export default function CMSViewer({ data }: CMSViewerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !ref.current) return;

    let editor: { destroy: () => void } | undefined;
    let cancelled = false;

    // Loaded lazily: Editor.js and every block tool reach for `window` at
    // import time, so they can only be pulled in once this effect runs in the
    // browser.
    void Promise.all([import('@editorjs/editorjs'), loadEditorTools()]).then(
      ([{ default: EditorJS }, tools]) => {
        if (cancelled || !ref.current) return;

        const holder = ref.current;

        editor = new EditorJS({
          holder,
          readOnly: true,
          // Must cover every type the editor can save, or those blocks render
          // as Editor.js's "can not be displayed correctly" stub.
          tools,
          data,
          onReady: () => growCodeBlocks(holder),
        });
      },
    );

    return () => {
      cancelled = true;
      editor?.destroy();
    };
  }, [data]);

  // `cms-viewer` scopes the read-only style overrides in `style.css` so they
  // don't reach the editor, which needs the tool's own resize behaviour.
  return <div ref={ref} className="cms-viewer" />;
}
