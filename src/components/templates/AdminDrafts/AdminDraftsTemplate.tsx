/** Admin drafts shell. Takes data already loaded, so the route stays thin. */
import { FilePlus2 } from 'lucide-react';
import LinkButton from '@atoms/LinkButton/LinkButton';
import Typography from '@atoms/Typography/Typography';
import DraftPostList from '@organisms/DraftPostList/DraftPostList';
import { ROUTES } from '@lib/constants/routes';
import type { Post } from '@models/post.model';

export interface AdminDraftsTemplateProps {
  drafts: Post[];
  /**
   * Set instead of `drafts` when the read failed. Rendered, not thrown, so a
   * blip leaves the rest of the shell usable.
   */
  error?: string;
}

const AdminDraftsTemplate = (props: AdminDraftsTemplateProps) => {
  const { drafts, error } = props;

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
        <DraftPostList drafts={drafts} />
      )}
    </section>
  );
};

export default AdminDraftsTemplate;
