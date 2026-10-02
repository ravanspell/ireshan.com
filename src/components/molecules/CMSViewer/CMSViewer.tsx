'use client';

import { useEffect, useRef } from 'react';
import { loadEditorTools } from '@lib/editor-tools';

interface CMSViewerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  /** Header block ids in order, from `extractHeadings` - targets for `#anchor` links. */
  headingIds?: string[];
}

/**
 * Editor.js renders headers without ids. Paired with `ids` by position, as
 * both are the header blocks in document order.
 */
function applyHeadingIds(holder: HTMLElement, ids: string[]) {
  holder.querySelectorAll<HTMLElement>('.ce-header').forEach((el, i) => {
    if (ids[i]) el.id = ids[i];
  });

  // The browser's own hash scroll ran before this content existed; redo it.
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash && ids.includes(hash)) {
    document.getElementById(hash)?.scrollIntoView();
  }
}

export default function CMSViewer({ data, headingIds }: CMSViewerProps) {
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
        const instance = new EditorJS({
          holder,
          readOnly: true,
          // Must cover every type the editor can save, or those blocks render
          // as Editor.js's "can not be displayed correctly" stub.
          tools,
          data,
        });
        editor = instance;

        if (headingIds?.length) {
          void instance.isReady.then(() => {
            if (!cancelled) applyHeadingIds(holder, headingIds);
          });
        }
      },
    );

    return () => {
      cancelled = true;
      editor?.destroy();
    };
  }, [data, headingIds]);

  // `cms-viewer` scopes the read-only style overrides in `style.css` so they
  // don't reach the editor, which needs the tool's own resize behaviour.
  return <div ref={ref} className="cms-viewer" />;
}
