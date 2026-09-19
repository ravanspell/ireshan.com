'use client';

import dynamic from 'next/dynamic';
import EditorField from '@molecules/EditorField/EditorField';
import EditorToolbar, { type SaveStatus } from '@molecules/EditorToolbar/EditorToolbar';
import TagInput from '@molecules/TagInput/TagInput';
import { EDITOR_HOLDER_ID } from '@hooks/useEditorJs';

/**
 * Pulled in only when Preview is first opened - most editing sessions never
 * open it, and it drags in `CMSViewer` and a second Editor.js instance.
 *
 * Declared at module scope: inside the component it would be a new component
 * type on every render, remounting the preview and re-running its load.
 */
const EditorPreview = dynamic(() => import('@organisms/EditorPreview/EditorPreview'), {
  loading: () => (
    <p className="text-muted-foreground mx-auto w-full max-w-4xl px-4 py-6 text-sm">
      Loading preview...
    </p>
  ),
});

export interface BlogEditorProps {
  /** "New Post", "Edit Post" or "Edit Draft". */
  modeLabel: string;
  isPublished: boolean;
  isPending: boolean;

  title: string;
  onTitleChange: (value: string) => void;
  slug: string;
  onSlugChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  tagSuggestions: string[];

  status: SaveStatus;
  saveError: string | null;
  uploadError: string | null;

  isPreview: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previewData: any;
  onTogglePreview: () => void;

  onPublish: () => void;
  onSaveDraft: () => void;
}

/**
 * The editor screen: toolbar, post metadata, and the Editor.js canvas.
 *
 * Presentational only - every value arrives as a prop and every interaction
 * leaves as a callback, so the save orchestration lives one layer up in
 * `BlogEditorTemplate`.
 */
export default function BlogEditor({
  modeLabel,
  isPublished,
  isPending,
  title,
  onTitleChange,
  slug,
  onSlugChange,
  tags,
  onTagsChange,
  tagSuggestions,
  status,
  saveError,
  uploadError,
  isPreview,
  previewData,
  onTogglePreview,
  onPublish,
  onSaveDraft,
}: BlogEditorProps) {
  return (
    <div className="w-full space-y-5">
      <EditorToolbar
        label={modeLabel}
        isPublished={isPublished}
        isPending={isPending}
        status={status}
        saveError={saveError}
        isPreview={isPreview}
        onTogglePreview={onTogglePreview}
        onPublish={onPublish}
        onSaveDraft={onSaveDraft}
      />

      {isPreview && <EditorPreview title={title} tags={tags} data={previewData} />}

      {/*
        Hidden, not unmounted: unmounting the holder destroys the Editor.js
        instance, which comes back holding the post as it was loaded - losing
        everything typed since.
      */}
      <div className={isPreview ? 'hidden' : 'space-y-5'}>
        <EditorField
          id="post-title"
          label="Title"
          value={title}
          onChange={onTitleChange}
          placeholder="Post title"
          inputClassName="text-lg font-medium"
        />

        <EditorField
          id="post-slug"
          label="Slug (/blog/..)"
          value={slug}
          onChange={onSlugChange}
          placeholder="post-slug"
          inputClassName="font-mono text-sm"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="post-tags">
            Tags
          </label>
          <TagInput
            id="post-tags"
            value={tags}
            onChange={onTagsChange}
            suggestions={tagSuggestions}
            disabled={isPending}
          />
        </div>

        <div
          id={EDITOR_HOLDER_ID}
          className="bg-field text-foreground min-h-64 rounded-md border border-input py-6 pr-4 pl-4 min-[651px]:pr-6 min-[651px]:pl-18"
        />
      </div>

      {uploadError && (
        <p className="text-destructive text-sm" role="alert">
          ❌ Upload failed: {uploadError}
        </p>
      )}
    </div>
  );
}
