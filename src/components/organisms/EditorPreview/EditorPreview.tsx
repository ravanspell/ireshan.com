'use client';

import CMSViewer from '@molecules/CMSViewer/CMSViewer';
import TagListContainer from '@molecules/TagListContainer/TagLIstContainer';

export interface EditorPreviewProps {
  title: string;
  tags: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

/**
 * The post as a reader would see it, rendered from unsaved editor content.
 *
 * Mirrors `/blog/[slug]`'s layout and reuses its `CMSViewer`, so the preview
 * can't drift from the public page block by block.
 */
export default function EditorPreview({ title, tags, data }: EditorPreviewProps) {
  const hasContent = Boolean(data?.blocks?.length);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-6">
      <h1 className="mb-8 text-5xl font-bold">{title || 'Untitled post'}</h1>

      {tags.length > 0 && <TagListContainer areaLabel="Post tags" tagLabels={tags} />}

      <div className="mt-10">
        {hasContent ? (
          <CMSViewer data={data} />
        ) : (
          <p className="text-muted-foreground">This post has no content yet.</p>
        )}
      </div>
    </article>
  );
}
