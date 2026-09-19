'use client';

import EditorField from '@molecules/EditorField/EditorField';
import EditorToolbar, { type SaveStatus } from '@molecules/EditorToolbar/EditorToolbar';
import TagInput from '@molecules/TagInput/TagInput';
import { EDITOR_HOLDER_ID } from '@/utils/hooks/useEditorJs';

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
        onPublish={onPublish}
        onSaveDraft={onSaveDraft}
      />

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

      {uploadError && (
        <p className="text-destructive text-sm" role="alert">
          ❌ Upload failed: {uploadError}
        </p>
      )}
    </div>
  );
}
