'use client';

import { Button } from '@/components/atoms/button';

export type SaveStatus = 'idle' | 'saving' | 'done' | 'error';

/** Which of the two save buttons started the save that's in flight. */
export type SaveAction = 'publish' | 'draft';

export interface EditorToolbarProps {
  /** What this session is - "New Post", "Edit Post" or "Edit Draft". */
  label: string;
  /** Drives the primary button's wording: an already-live post is updated, not published. */
  isPublished: boolean;
  isPending: boolean;
  /** Read only while `isPending` - the button that shows "Saving...". */
  pendingAction: SaveAction | null;
  status: SaveStatus;
  /** The reason the last save failed, when there is one to show. */
  saveError: string | null;
  isPreview: boolean;
  onTogglePreview: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
}

/**
 * The editor's action bar: which post you're in on the left, the two save
 * actions on the right.
 *
 * Save feedback lives here rather than at the foot of the page so it appears
 * beside the button that caused it.
 */
export default function EditorToolbar({
  label,
  isPublished,
  isPending,
  pendingAction,
  status,
  saveError,
  isPreview,
  onTogglePreview,
  onPublish,
  onSaveDraft,
}: EditorToolbarProps) {
  // Every button is disabled during a save, but only the one that started it
  // says so - the other keeps its label so it's clear what it does.
  const isSavingDraft = isPending && pendingAction === 'draft';
  const isSavingPost = isPending && pendingAction === 'publish';

  return (
    <div className="space-y-2 pb-0.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-foreground text-xl font-semibold">
          {label}
          {isPreview && <span className="text-muted-foreground font-normal"> · Preview</span>}
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled={isPending} onClick={onTogglePreview}>
            {isPreview ? 'Back to editing' : 'Preview'}
          </Button>
          <Button variant="outline" disabled={isPending} onClick={onSaveDraft}>
            {isSavingDraft ? 'Saving...' : 'Save draft'}
          </Button>
          <Button disabled={isPending} onClick={onPublish}>
            {isSavingPost ? 'Saving...' : isPublished ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {status === 'done' && <p className="text-sm text-green-500">✅ Saved successfully!</p>}
      {status === 'error' && (
        <p className="text-destructive text-sm" role="alert">
          ❌ Save failed{saveError ? `: ${saveError}` : '.'}
        </p>
      )}
    </div>
  );
}
