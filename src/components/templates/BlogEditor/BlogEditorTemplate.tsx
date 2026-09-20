'use client';

import { useState, useTransition } from 'react';
import { saveArticleAction } from '@/app/actions/artical';
import BlogEditor from '@organisms/BlogEditor/BlogEditor';
import type { SaveAction, SaveStatus } from '@molecules/EditorToolbar/EditorToolbar';
import { useEditorJs } from '@hooks/useEditorJs';
import { slugify } from '@lib/slug';

export interface BlogEditorTemplateProps {
  /** Present when editing an existing post; absent when drafting a new one. */
  articleId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialPublished?: boolean;
  /** Tag names already on the post. */
  initialTags?: string[];
  /** Every tag that exists, for autocomplete. */
  tagSuggestions?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

/**
 * Editor screen orchestration: form state, the Editor.js instance, and the
 * save.
 *
 * This is the template layer because the page it serves is a Server Component
 * - `saveArticleAction` is called from the browser with state the server never
 * holds, so the logic can't move any further up than this.
 */
export default function BlogEditorTemplate({
  articleId,
  initialTitle = '',
  initialSlug = '',
  initialPublished = false,
  initialTags = [],
  tagSuggestions = [],
  initialData,
}: BlogEditorTemplateProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  // keeps track which action is pending right now to show loading
  const [pendingAction, setPendingAction] = useState<SaveAction | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [tags, setTags] = useState<string[]>(initialTags);
  // Stops deriving from the title once the author edits the slug by hand, so
  // renaming a published post doesn't silently change its URL.
  const [slugTouched, setSlugTouched] = useState(Boolean(initialSlug));
  // Held in state rather than read on render: pulling the document out of
  // Editor.js is asynchronous.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [previewData, setPreviewData] = useState<any>(null);

  const { save: saveDocument } = useEditorJs({ initialData, onUploadError: setUploadError });

  const modeLabel = !articleId ? 'New Post' : initialPublished ? 'Edit Post' : 'Edit Draft';

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const onSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(slugify(value));
  };

  /**
   * Swap between writing and the reader's view, snapshotting the editor on the
   * way in. Nothing is written to the database - this previews unsaved work.
   */
  const togglePreview = async (): Promise<void> => {
    if (previewData) {
      setPreviewData(null);
      return;
    }

    const outputData = await saveDocument();
    // Only `undefined` while Editor.js is still loading - nothing to show yet.
    if (!outputData) return;

    setPreviewData(outputData);
  };

  /**
   * Save the content of the blog post
   *
   * @param published publish status true = published / false= draft
   * @returns void
   */
  const save = async (published: boolean): Promise<void> => {
    const trimmedTitle = title.trim();
    const finalSlug = (slug || slugify(trimmedTitle)).trim();

    if (!trimmedTitle || !finalSlug) {
      setSaveError('Title and slug are both required.');
      setStatus('error');
      return;
    }

    try {
      const outputData = await saveDocument();
      if (!outputData) return;

      setStatus('saving');
      setPendingAction(published ? 'publish' : 'draft');

      // call the server action (runs on server)
      startTransition(async () => {
        const result = await saveArticleAction({
          id: articleId,
          title: trimmedTitle,
          slug: finalSlug,
          content: outputData,
          published,
          tagNames: tags,
        });

        if (!result?.success) {
          // Field errors come back from Zod, `error` from a domain failure.
          const message = result?.errors ? Object.values(result.errors).join(', ') : result?.error;
          console.error('Saving failed:', message);
          setSaveError(message ?? 'Unknown error');
          setStatus('error');
          return;
        }

        setSaveError(null);
        // Both come back normalised by the server - the slug may have been
        // derived, and tag names resolve to whatever spelling the existing tag
        // rows use.
        setSlug(result.data.slug);
        setTags(result.data.tags.map((tag) => tag.name));
        setStatus('done');
      });
    } catch (error) {
      console.error('Saving failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <BlogEditor
      modeLabel={modeLabel}
      isPublished={initialPublished}
      isPending={isPending}
      pendingAction={pendingAction}
      title={title}
      onTitleChange={onTitleChange}
      slug={slug}
      onSlugChange={onSlugChange}
      tags={tags}
      onTagsChange={setTags}
      tagSuggestions={tagSuggestions}
      status={status}
      saveError={saveError}
      uploadError={uploadError}
      isPreview={previewData !== null}
      previewData={previewData}
      onTogglePreview={togglePreview}
      onPublish={() => save(true)}
      onSaveDraft={() => save(false)}
    />
  );
}
