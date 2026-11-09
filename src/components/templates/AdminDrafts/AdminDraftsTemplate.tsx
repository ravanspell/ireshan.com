'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus2 } from 'lucide-react';
import LinkButton from '@atoms/LinkButton/LinkButton';
import Typography from '@atoms/Typography/Typography';
import AlertDialog from '@molecules/AlertDialog/AlertDialog';
import DraftPostList from '@organisms/DraftPostList/DraftPostList';
import { deleteDraftAction } from '@/app/actions/artical';
import { ROUTES } from '@lib/constants/routes';
import type { Post } from '@modules/post/post.model';

export interface AdminDraftsTemplateProps {
  drafts: Post[];
  /**
   * Set instead of `drafts` when the read failed. Rendered, not thrown, so a
   * blip leaves the rest of the shell usable.
   */
  error?: string;
}

/**
 * Admin drafts shell. Owns the delete confirmation and write, so the page stays
 * a Server Component and the list and cards stay presentational.
 */
const AdminDraftsTemplate = (props: AdminDraftsTemplateProps) => {
  const { drafts, error } = props;
  const router = useRouter();
  const [pendingDraft, setPendingDraft] = useState<Post | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const closeDialog = (open: boolean) => {
    // Stay open while deleting, so the result has somewhere to show.
    if (open || isDeleting) return;
    setPendingDraft(null);
    setDeleteError(null);
  };

  const confirmDelete = () => {
    if (!pendingDraft) return;
    setDeleteError(null);

    startDelete(async () => {
      const result = await deleteDraftAction(pendingDraft.id);

      if (!result.success) {
        setDeleteError(result.error ?? 'Failed to delete this draft.');
        return;
      }

      setPendingDraft(null);
      // Re-fetch the list the action just revalidated.
      router.refresh();
    });
  };

  return (
    <section className="flex flex-col gap-6" aria-labelledby="admin-drafts-heading">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typography
            variant="h1"
            as="h1"
            id="admin-drafts-heading"
            className="text-2xl font-bold"
            text="Drafts"
          />
          {!error && (
            <Typography
              as="p"
              className="text-muted-foreground text-sm"
              text={
                drafts.length === 1 ? '1 unpublished post' : `${drafts.length} unpublished posts`
              }
            />
          )}
        </div>

        <LinkButton
          href={ROUTES.ADMIN.EDITOR}
          label="New post"
          icon={FilePlus2}
          variant="primary"
          testId="drafts-new-post"
        />
      </header>

      {error ? (
        <Typography
          as="p"
          id="admin-drafts-error"
          role="alert"
          className="text-destructive rounded-lg border border-destructive/40 p-4 text-sm"
          text={error}
        />
      ) : (
        <DraftPostList drafts={drafts} onDelete={setPendingDraft} />
      )}

      <AlertDialog
        open={pendingDraft !== null}
        title="Delete this draft?"
        description={`"${pendingDraft?.title || 'Untitled draft'}" and its content are deleted permanently. This can't be undone.`}
        confirmLabel="Delete draft"
        pendingLabel="Deleting..."
        confirmVariant="destructive"
        isPending={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onOpenChange={closeDialog}
        testId="delete-draft-dialog"
      />
    </section>
  );
};

export default AdminDraftsTemplate;
